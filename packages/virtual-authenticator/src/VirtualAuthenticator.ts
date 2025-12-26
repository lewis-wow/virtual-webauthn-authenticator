import { UUIDMapper } from '@repo/core/mappers';
import { Hash } from '@repo/crypto';
import { assertSchema } from '@repo/utils';
import * as cbor from 'cbor2';
import { randomUUID } from 'node:crypto';
import { match } from 'ts-pattern';
import z from 'zod';

import type {
  AuthenticatorGetAssertionPayload,
  AuthenticatorMakeCredentialPayload,
  IAuthenticator,
} from './IAuthenticator';
import { Fmt } from './enums/Fmt';
import { WebAuthnCredentialKeyMetaType } from './enums/WebAuthnCredentialKeyMetaType';
import { CredentialExcluded } from './exceptions/CredentialExcluded';
import { GenerateKeyPairFailed } from './exceptions/GenerateKeyPairFailed';
import { NoSupportedPubKeyCredParamFound } from './exceptions/NoSupportedPubKeyCredParamWasFound';
import { SignatureFailed } from './exceptions/SignatureFailed';
import type { IWebAuthnRepository } from './repositories/IWebAuthnRepository';
import type { IKeyProvider } from './types/IKeyProvider';
import type { WebAuthnCredentialWithMeta } from './types/WebAuthnCredentialWithMeta';
import {
  AuthenticatorContextArgsSchema,
  type AuthenticatorContextArgs,
} from './zod-validation/AuthenticatorContextArgsSchema';
import {
  AuthenticatorGetAssertionArgsSchema,
  type AuthenticatorGetAssertionArgs,
} from './zod-validation/AuthenticatorGetAssertionArgsSchema';
import {
  AuthenticatorMakeCredentialArgsSchema,
  type AuthenticatorMakeCredentialArgs,
} from './zod-validation/AuthenticatorMakeCredentialArgsSchema';
import {
  AuthenticatorMetaArgsSchema,
  type AuthenticatorMetaArgs,
} from './zod-validation/AuthenticatorMetaArgsSchema';
import {
  SupportedPubKeyCredParamSchema,
  type PubKeyCredParam,
  type SupportedPubKeyCredParam,
} from './zod-validation/CredParamSchema';

export type AuthenticatorBackendContext = {
  apiKeyId: string;
};

export type VirtualAuthenticatorOptions = {
  webAuthnRepository: IWebAuthnRepository;
  keyProvider: IKeyProvider;
};

/**
 * A virtual WebAuthn Authenticator implementation compliant with W3C Level 3 and CTAP2 specifications.
 *
 * This class simulates both registration (`createCredential`) and authentication (`getCredential`) ceremonies
 * for testing and simulation purposes. It enforces strict protocol constraints, including Origin validation,
 * RP ID checks, and User Verification (UV) requirements.
 *
 * Through configurable metadata, it allows simulation of various hardware states (e.g., User Verification
 * availability, User Presence) and handles specific error scenarios like `UserVerificationNotAvailable`.
 */
export class VirtualAuthenticator implements IAuthenticator {
  public readonly webAuthnRepository: IWebAuthnRepository;
  private readonly keyProvider: IKeyProvider;

  constructor(opts: VirtualAuthenticatorOptions) {
    this.webAuthnRepository = opts.webAuthnRepository;
    this.keyProvider = opts.keyProvider;
  }

  /**
   * The AAGUID of the authenticator (16 bytes, zeroed-out).
   * @see https://www.w3.org/TR/webauthn-3/#aaguid
   */
  static readonly AAGUID = new Uint8Array(Buffer.alloc(16));

  static readonly SUPPORTED_ATTESTATION_FORMATS: string[] = [
    Fmt.NONE,
    Fmt.PACKED,
  ];

  /**
   * Finds and returns the first supported public key credential parameter from a given list.
   *
   * This function iterates through an array of `PubKeyCredParamLoose` objects and returns the
   * first one that successfully validates against the `PubKeyCredParamStrictSchema`.
   *
   * @param {PubKeyCredParamLoose[]} pubKeyCredParams - An array of public key credential parameters to check.
   * @returns {PubKeyCredParamStrict} The first parameter from the array that is supported (passes strict validation).
   * @throws {NoSupportedPubKeyCredParamFound} Throws this error if no parameter in the array is supported.
   */
  private _findFirstSupportedCredTypesAndPubKeyAlgsOrThrow(
    pubKeyCredParams: PubKeyCredParam[],
  ): SupportedPubKeyCredParam {
    for (const pubKeyCredParam of pubKeyCredParams) {
      const result = SupportedPubKeyCredParamSchema.safeParse(pubKeyCredParam);
      if (result.success) {
        return result.data;
      }
    }

    throw new NoSupportedPubKeyCredParamFound();
  }

  /**
   * Creates attested credential data structure.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-attested-credential-data
   */
  private async _createAttestedCredentialData(opts: {
    credentialID: Uint8Array;
    COSEPublicKey: Uint8Array;
  }): Promise<Uint8Array> {
    const { credentialID, COSEPublicKey } = opts;

    // Byte length L of Credential ID, 16-bit unsigned big-endian integer.
    // Length (in bytes): 2
    const credentialIdLength = Buffer.alloc(2);
    credentialIdLength.writeUInt16BE(opts.credentialID.length, 0);

    // Attested credential data: variable-length byte array for attestation object.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-attested-credential-data
    const attestedCredentialData = Buffer.concat([
      VirtualAuthenticator.AAGUID,
      credentialIdLength,
      credentialID,
      // The credential public key encoded in COSE_Key format, as defined
      // in Section 7 of [RFC8152],
      // using the CTAP2 canonical CBOR encoding form.
      // The COSE_Key-encoded credential public key MUST contain the "alg" parameter
      // and MUST NOT contain any other OPTIONAL parameters.
      // The "alg" parameter MUST contain a COSEAlgorithm value.
      // The encoded credential public key MUST also contain any
      // additional REQUIRED parameters
      // stipulated by the relevant key type specification, i.e., REQUIRED
      // for the key type "kty"
      // and algorithm "alg" (see Section 8 of [RFC8152]).
      // Length (in bytes): {variable}
      COSEPublicKey,
    ]);

    return new Uint8Array(attestedCredentialData);
  }

  /**
   * Creates authenticator data structure with flags and counters.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
   */
  private async _createAuthenticatorData(opts: {
    rpId: string;
    counter: number;
    attestedCredentialData: Uint8Array | undefined;
    requireUserVerification: boolean;
    userVerificationEnabled: boolean;
    userPresenceEnabled: boolean;
  }): Promise<Uint8Array> {
    const {
      rpId,
      counter,
      attestedCredentialData,
      requireUserVerification,
      userVerificationEnabled,
      userPresenceEnabled,
    } = opts;

    // SHA-256 hash of the RP ID the credential is scoped to.
    // Length (in bytes): 32
    const rpIdHash = Hash.sha256(Buffer.from(rpId));

    // Bit 0 (UP - User Present): Result of the user presence test
    // (1 = present, 0 = not present).
    // Bit 1 (RFU1): Reserved for future use.
    // Bit 2 (UV - User Verified): Result of the user verification test
    // (1 = verified, 0 = not verified).
    // Bits 3-5 (RFU2): Reserved for future use.
    // Bit 6 (AT - Attested Credential Data Included): Indicates if
    // attested credential data is included.
    // Bit 7 (ED - Extension data included): Indicates if extension data
    // is included in the authenticator data.
    // Length (in bytes): 1

    let flagsInt = 0b00000000;

    // Bit 0: User Present (UP)
    // Always 1 for standard WebAuthn flows
    if (userPresenceEnabled) {
      flagsInt |= 0b00000001;
    }

    // Bit 2: User Verified (UV)
    // Set if user verification is required and the authenticator is capable
    if (userVerificationEnabled && requireUserVerification) {
      flagsInt |= 0b00000100;
    }

    // Bit 6: Attested Credential Data (AT)
    // Only set if we are creating a new credential (registration),
    // indicated by the presence of credentialID
    if (attestedCredentialData) {
      flagsInt |= 0b01000000;
    }

    const flags = Buffer.from([flagsInt]);

    // Signature counter, 32-bit unsigned big-endian integer.
    // Length (in bytes): 4
    const signCountBuffer = Buffer.alloc(4);
    signCountBuffer.writeUInt32BE(counter, 0);

    // Concatenate authenticator data components per spec.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
    const authenticatorData = Buffer.concat(
      [
        rpIdHash,
        flags,
        signCountBuffer,
        attestedCredentialData,
        // --- OPTIONAL CREDENTIALS --- (
        //    Extension-defined authenticator data.
        //    This is a CBOR [RFC8949] map with extension identifiers as keys,
        //    and authenticator extension outputs as values.
        //    @see https://www.w3.org/TR/webauthn-2/#sctn-extensions
        // )
      ].filter((value) => value !== undefined),
    );

    return new Uint8Array(authenticatorData);
  }

  /**
   * Creates data to be signed: concatenation of authData and clientDataHash.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
   */
  private _createDataToSign(opts: {
    clientDataHash: Uint8Array;
    authData: Uint8Array;
  }): Uint8Array {
    const { clientDataHash, authData } = opts;

    const dataToSign = Buffer.concat([authData, clientDataHash]);

    return new Uint8Array(dataToSign);
  }

  /**
   * Handles 'none' attestation (no attestation statement).
   * @see https://www.w3.org/TR/webauthn-3/#sctn-none-attestation
   */
  private _handleAttestationNone(): Map<string, Uint8Array | number> {
    // For "none" attestation, the attestation statement is an empty CBOR map
    const attStmt = new Map<string, Uint8Array | number>();

    return attStmt;
  }

  /**
   * Handles 'packed' attestation using self-attestation.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-packed-attestation
   */
  private async _handleAttestationPacked(opts: {
    webAuthnCredential: WebAuthnCredentialWithMeta;
    data: {
      clientDataHash: Uint8Array;
      authData: Uint8Array;
    };
  }): Promise<Map<string, Uint8Array | number>> {
    const { webAuthnCredential, data } = opts;

    const dataToSign = this._createDataToSign(data);

    // Sign the data to create the attestation signature
    const { signature, alg } = await this.keyProvider
      .sign({
        data: dataToSign,
        webAuthnCredential,
      })
      .catch((error) => {
        throw new SignatureFailed({
          cause: error,
        });
      });

    // For packed self-attestation, attStmt contains alg and sig
    const attStmt = new Map<string, Uint8Array | number>([
      ['alg', alg],
      ['sig', new Uint8Array(signature)],
    ]);

    return attStmt;
  }

  /**
   * Find the first supported attestation statement format identifier.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred (Step 12)
   *
   * Let attestationFormat be the first supported attestation statement format identifier
   * from attestationFormats, taking into account enterpriseAttestationPossible.
   * If attestationFormats contains no supported value, use the most preferred format.
   *
   * @param attestationFormats - List of attestation format identifiers from the client
   * @returns The first supported format, or the most preferred format (Fmt.NONE) if none are supported
   */
  private _findFirstSupportedAttestationFormat(opts: {
    attestationFormats: string[];
  }): Fmt {
    const { attestationFormats } = opts;

    // Find the first attestation format from the list that this
    // authenticator supports
    const firstSupportedAttestationFormat = attestationFormats.find(
      (attestationFormat) =>
        VirtualAuthenticator.SUPPORTED_ATTESTATION_FORMATS.includes(
          attestationFormat,
        ),
    );

    // If no supported format found, return the most preferred format (Fmt.NONE)
    return (firstSupportedAttestationFormat as Fmt) ?? Fmt.NONE;
  }

  /**
   * @see https://www.w3.org/TR/webauthn-3/#sctn-generating-an-attestation-object
   */
  private async _generateAttestationObject(opts: {
    webAuthnCredential: WebAuthnCredentialWithMeta;

    attestationFormat: Fmt;
    authData: Uint8Array;
    hash: Uint8Array;
  }): Promise<Map<string, unknown>> {
    const { webAuthnCredential, attestationFormat, authData, hash } = opts;

    let attStmt: Map<string, Uint8Array | number>;

    switch (attestationFormat) {
      case Fmt.NONE:
        // For "none" attestation, create empty attestation statement
        attStmt = this._handleAttestationNone();
        break;
      case Fmt.PACKED:
        // For "packed" attestation, create self-attestation with signature
        attStmt = await this._handleAttestationPacked({
          webAuthnCredential,
          data: { clientDataHash: hash, authData },
        });
        break;
      default:
        throw new Error('Unsupported attestation format is used.');
    }

    const attestationObject = new Map<string, unknown>([
      ['fmt', attestationFormat],
      ['attStmt', attStmt],
      ['authData', authData],
    ]);

    return attestationObject;
  }

  /**
   * The authenticatorMakeCredential operation.
   * This is the authenticator-side operation for creating a new credential.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred
   */
  public async authenticatorMakeCredential(opts: {
    authenticatorMakeCredentialArgs: AuthenticatorMakeCredentialArgs;
    meta: AuthenticatorMetaArgs;
    context: AuthenticatorContextArgs;
  }): Promise<AuthenticatorMakeCredentialPayload> {
    const { authenticatorMakeCredentialArgs, meta, context } = opts;

    // Step 1: Check if all the supplied parameters are syntactically well-formed and of the correct length.
    // If not, return an error code equivalent to "UnknownError" and terminate the operation.
    assertSchema(
      authenticatorMakeCredentialArgs,
      AuthenticatorMakeCredentialArgsSchema,
    );

    // Meta validation
    assertSchema(meta, AuthenticatorMetaArgsSchema);
    // Context validation
    assertSchema(context, AuthenticatorContextArgsSchema);

    const {
      hash,
      rpEntity,
      userEntity,
      // requireResidentKey,
      requireUserPresence,
      requireUserVerification,
      credTypesAndPubKeyAlgs,
      // enterpriseAttestationPossible,
      attestationFormats,
      excludeCredentialDescriptorList,
      // extensions,
    } = authenticatorMakeCredentialArgs;

    // Step 2: Check if at least one of the specified combinations of
    // PublicKeyCredentialType and cryptographic parameters in
    // credTypesAndPubKeyAlgs is supported.
    // If not, return an error code equivalent to "NotSupportedError" and
    // terminate the operation.
    const selectedCredTypeAndAlg =
      this._findFirstSupportedCredTypesAndPubKeyAlgsOrThrow(
        credTypesAndPubKeyAlgs,
      );

    // Step 3: For each descriptor of excludeCredentialDescriptorList:
    if (
      excludeCredentialDescriptorList &&
      excludeCredentialDescriptorList.length > 0
    ) {
      const credentialIds = excludeCredentialDescriptorList
        .map((excludeCredentialDescriptor) => {
          try {
            return UUIDMapper.bytesToUUID(excludeCredentialDescriptor.id);
          } catch {
            return undefined;
          }
        })
        .filter((credentialId) => credentialId !== undefined);

      // Step 3.1: If looking up descriptor.id in this authenticator returns non-null:
      // Collect an authorization gesture confirming user consent for creating a new credential.
      // The authorization gesture MUST include a test of user presence.
      // If the user confirms consent to create a new credential, return an error code equivalent to "InvalidStateError" and terminate the operation.
      // If the user does not consent to create a new credential, return an error code equivalent to "NotAllowedError" and terminate the operation.
      // NOTE: In this backend authenticator implementation, user consent and presence have already been collected by the agent/client.
      // Finding a matching excluded credential throws CredentialExcluded error.
      // The search for finding existing credential is done as batch operation for effectivity.
      const credentialExists =
        await this.webAuthnRepository.findAllByRpIdAndCredentialIds({
          rpId: rpEntity.id,
          credentialIds,
        });

      // If credential exists and the RP ID matches (type matching is implicit as we only store public-key type)
      if (credentialExists.length > 0) {
        throw new CredentialExcluded();
      }
    }

    // Step 4: If requireResidentKey is true and the authenticator cannot store a client-side discoverable credential:
    // Return an error code equivalent to "ConstraintError" and terminate the operation.
    // NOTE: This backend authenticator can store credentials, so this check passes.

    // Step 5: If requireUserVerification is true and the authenticator
    // cannot perform user verification
    // NOTE: This authenticator's capability is determined by the
    // agent/client that calls it.
    // The agent ensures that if requireUserVerification is true, the
    // authenticator can perform UV.

    // Step 6: Collect an authorization gesture confirming user consent for creating a new credential.
    // The authorization gesture MUST include a test of user presence.
    // If requireUserVerification is true, the authorization gesture MUST include user verification.
    // If requireUserPresence is true, the authorization gesture MUST include a test of user presence.
    // If the user does not consent, return an error code equivalent to "NotAllowedError" and terminate the operation.
    // NOTE: In this backend authenticator, user consent and presence are assumed to have been collected by the agent/client before this operation is invoked. The requireUserPresence and requireUserVerification parameters indicate what was required.

    // Step 7: Once the authorization gesture has been completed, generate
    // a new credential object
    // Step 7.1: Let (publicKey, privateKey) be a new pair of cryptographic
    // keys using the FIRST supported algorithm
    const webAuthnCredentialId = randomUUID();
    const rawCredentialID = UUIDMapper.UUIDtoBytes(webAuthnCredentialId);

    const webAuthnCredentialPublicKey = await this.keyProvider
      .generateKeyPair({
        webAuthnCredentialId,
        pubKeyCredParams: selectedCredTypeAndAlg,
      })
      .catch((error) => {
        throw new GenerateKeyPairFailed({ cause: error });
      });

    assertSchema(
      webAuthnCredentialPublicKey.webAuthnCredentialKeyMetaType,
      z.enum(WebAuthnCredentialKeyMetaType),
    );

    // Step 7.2: Let userHandle be userEntity.id.
    const userHandle = UUIDMapper.bytesToUUID(userEntity.id);

    // Step 7.3: Let credentialSource be a new public key credential source
    // with the following fields:
    // type: "public-key"
    // privateKey: privateKey
    // rpId: rpEntity.id
    // userHandle: userHandle
    // otherUI: Any other information the authenticator chooses to include.

    // Step 7.4: If requireResidentKey is true or the authenticator chooses
    // to create a client-side discoverable credential:
    // Let credentialId be a new credential id.
    // Set credentialSource.id to credentialId.
    // Store credentialSource in the authenticator.
    // Otherwise:
    // Let credentialId be the result of serializing and encrypting credentialSource.
    // NOTE: In this implementation, we always store credentials in the
    // repository (backend database).
    const webAuthnCredentialWithMeta = await match({
      webAuthnCredentialKeyMetaType:
        webAuthnCredentialPublicKey.webAuthnCredentialKeyMetaType,
    })
      .returnType<Promise<WebAuthnCredentialWithMeta>>()
      .with(
        {
          webAuthnCredentialKeyMetaType:
            WebAuthnCredentialKeyMetaType.KEY_VAULT,
        },
        async () => {
          const webAuthnCredentialWithKeyVaultMeta =
            await this.webAuthnRepository.createKeyVaultWebAuthnCredential({
              id: webAuthnCredentialId,
              webAuthnCredentialKeyVaultKeyMeta:
                webAuthnCredentialPublicKey.webAuthnCredentialKeyVaultKeyMeta,
              COSEPublicKey: webAuthnCredentialPublicKey.COSEPublicKey,
              rpId: rpEntity.id,
              userId: userHandle,
              apiKeyId: context.apiKeyId,
            });

          return webAuthnCredentialWithKeyVaultMeta;
        },
      )
      .exhaustive();

    // Step 9: If any error occurred while creating the new credential object:
    // Return an error code equivalent to "UnknownError" and terminate the operation.
    // NOTE: Handled by try-catch in generateKeyPair and repository operations.

    // Step 10: Let the signature counter value for the new credential
    // The counter is initialized in the repository as part of credential creation.
    // Per spec, it can be:
    // - Zero (for U2F devices)
    // - Global signature counter's actual value
    // - Per-credential counter initialized to zero
    // NOTE: The counter is initialized in the repository as part of credential creation.

    // Step 11: Let attestedCredentialData be the attested credential data
    // byte array including:
    // The authenticator's AAGUID.
    // The length of credentialId (2 bytes, big-endian).
    // credentialId.
    // The credential public key encoded in COSE_Key format.

    // Step 12: Let attestationFormat be the first supported attestation
    // statement format identifier from attestationFormats, taking into
    // account enterpriseAttestationPossible.
    // If attestationFormats contains no supported value, use the most
    // preferred format.
    const attestationFormat = this._findFirstSupportedAttestationFormat({
      attestationFormats,
    });

    const attestedCredentialData = await this._createAttestedCredentialData({
      credentialID: rawCredentialID,
      COSEPublicKey: webAuthnCredentialWithMeta.COSEPublicKey,
    });

    // Step 13: Let authenticatorData be the byte array specified in §6.1
    // Authenticator Data including attestedCredentialData and
    // processedExtensions (if any).
    const authenticatorData = await this._createAuthenticatorData({
      rpId: rpEntity.id,
      counter: webAuthnCredentialWithMeta.counter,
      attestedCredentialData,
      requireUserVerification,
      // Virtual authenticator is always capable of user verification and user presence
      userVerificationEnabled: true,
      userPresenceEnabled: true,
    });

    // Step 14: Create an attestation object for the new credential using
    // the procedure specified in §6.5.4 Generating an Attestation Object.
    const attestationObject = await this._generateAttestationObject({
      webAuthnCredential: webAuthnCredentialWithMeta,

      attestationFormat,
      hash,
      authData: authenticatorData,
    });

    const attestationObjectCborEncoded = cbor.encode(attestationObject);

    // Return the attestation object to the client
    return {
      credentialId: rawCredentialID,
      attestationObject: attestationObjectCborEncoded,
    };
  }

  /**
   * The authenticatorGetAssertion operation.
   * This is the authenticator-side operation for generating an assertion.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
   */
  public async authenticatorGetAssertion(opts: {
    authenticatorGetAssertionArgs: AuthenticatorGetAssertionArgs;
    meta: AuthenticatorMetaArgs;
    context: AuthenticatorContextArgs;
  }): Promise<AuthenticatorGetAssertionPayload> {
    const { authenticatorGetAssertionArgs, meta, context } = opts;

    // Step 1: Check if all the supplied parameters are syntactically well-formed and of the correct length.
    // If not, return an error code equivalent to "UnknownError" and terminate the operation.
    assertSchema(
      authenticatorGetAssertionArgs,
      AuthenticatorGetAssertionArgsSchema,
    );

    // Meta validation
    assertSchema(meta, AuthenticatorMetaArgsSchema);
    // Context validation
    assertSchema(context, AuthenticatorContextArgsSchema);

    const {
      hash,
      rpId,
      allowCredentialDescriptorList,
      requireUserPresence,
      requireUserVerification,
      // extensions,
    } = authenticatorGetAssertionArgs;

    // Step 2: Let credentialOptions be a new empty set of public key credential sources.
    // NOTE: Not implemented as a separate data structure. Credential filtering is handled
    // directly in the repository query below.

    // Step 3-7 and Step 9: Credential selection, user consent, and counter increment
    // This operation combines multiple spec steps into a single atomic repository operation:
    //
    // Step 3: If allowCredentialDescriptorList was supplied, then for each descriptor of allowCredentialDescriptorList:
    //   If allowCredentialDescriptorList was supplied:
    //     For each descriptor of allowCredentialDescriptorList:
    //       Let credSource be the result of looking up descriptor.id in this authenticator.
    //       If credSource is not null, append it to credentialOptions.
    // Step 4: Otherwise (allowCredentialDescriptorList was not supplied):
    //     For each key → credSource of this authenticator's credentials map, append credSource to credentialOptions.
    //   NOTE: Implemented via repository query with optional allowCredentialDescriptorList filter.
    //
    // Step 5: Filter by rpId
    //   Remove any items from credentialOptions whose rpId is not equal to rpId.
    //   NOTE: Implemented as part of the repository query filter.
    //
    // Step 6: Check if credentialOptions is empty
    //   If credentialOptions is now empty, return an error code equivalent to "NotAllowedError" and terminate the operation.
    //   NOTE: Implemented via repository's orThrow - throws if no credential found.
    //
    // Step 7: Prompt user to select credential and collect authorization gesture
    //   Prompt the user to select a public key credential source selectedCredential from credentialOptions.
    //   Collect an authorization gesture confirming user consent for using selectedCredential.
    //   If requireUserVerification is true, the authorization gesture MUST include user verification.
    //   If requireUserPresence is true, the authorization gesture MUST include a test of user presence.
    //   If the user does not consent, return an error code equivalent to "NotAllowedError" and terminate the operation.
    //   NOTE: User prompts and gestures are not applicable to a backend virtual authenticator for testing.
    //   The implementation automatically selects the first matching credential. User verification and presence
    //   checks are handled later in Step 10 during authenticatorData creation.
    //
    // Step 9: Increment signature counter
    //   Increment the credential associated signature counter or the global signature counter value,
    //   depending on which approach is implemented by the authenticator, by some positive value.
    //   If the authenticator does not implement a signature counter, let the signature counter value remain constant at zero.
    //   NOTE: Implemented atomically in the repository operation to prevent race conditions.
    //   The counter is incremented by 1 for each assertion operation.
    //
    // @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion (steps 3-7, 9)
    const webAuthnCredentialWithMeta =
      await this.webAuthnRepository.findFirstAndIncrementCounterAtomicallyOrThrow(
        {
          userId: meta.userId,
          rpId,
          apiKeyId: context.apiKeyId,
          allowCredentialDescriptorList: allowCredentialDescriptorList?.map(
            (allowCredentialDescriptor) =>
              UUIDMapper.bytesToUUID(allowCredentialDescriptor.id),
          ),
        },
      );

    // Step 8: Let processedExtensions be the result of authenticator extension processing for each supported extension identifier → authenticator extension input in extensions.
    // NOTE: Extension processing is skipped.

    // Step 9: Increment the credential associated signature counter or the global signature counter value.
    // NOTE: Already implemented in the webAuthnRepository.

    // Step 10: Let authenticatorData be the byte array specified in §6.1 Authenticator Data
    // including processedExtensions, if any, as the extensions
    // and excluding attestedCredentialData.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
    const authenticatorData = await this._createAuthenticatorData({
      // excluding attestedCredentialData
      attestedCredentialData: undefined,
      rpId,
      counter: webAuthnCredentialWithMeta.counter,
      requireUserVerification,
      // Virtual authenticator is always capable of user verification and user presence
      userVerificationEnabled: true,
      userPresenceEnabled: true,
      // NOTE: Extensions are not implemented.
    });

    // Step 11: Let signature be the assertion signature of the concatenation authenticatorData || hash using the privateKey of selectedCredential.
    // A simple, undelimited concatenation is safe to use here because the authenticator data describes its own length.
    // The hash of the serialized client data (which potentially has a variable length) is always the last element.
    const dataToSign = this._createDataToSign({
      clientDataHash: hash,
      authData: authenticatorData,
    });

    const { signature } = await this.keyProvider
      .sign({
        data: dataToSign,
        webAuthnCredential: webAuthnCredentialWithMeta,
      })
      .catch((error) => {
        // Step 12: If any error occurred while generating the assertion signature:
        // Return an error code equivalent to "UnknownError" and terminate the operation.
        throw new SignatureFailed({
          cause: error,
        });
      });

    // Step 13: Return to the user agent:
    // selectedCredential.id, if either a list of credentials (i.e., allowCredentialDescriptorList) of length 2 or greater was supplied by the client, or no such list was supplied.
    // authenticatorData.
    // signature.
    // selectedCredential.userHandle.
    // NOTE: If, within allowCredentialDescriptorList, the client supplied exactly one credential and it was successfully employed, then its credential ID is not returned since the client already knows it.

    const credentialId = UUIDMapper.UUIDtoBytes(webAuthnCredentialWithMeta.id);
    const userHandle = UUIDMapper.UUIDtoBytes(
      webAuthnCredentialWithMeta.userId,
    );

    return {
      credentialId,
      authenticatorData,
      signature,
      userHandle,
    };
  }

  public async authenticatorCancel() {
    // NOTE: Not implemented.
  }
}
