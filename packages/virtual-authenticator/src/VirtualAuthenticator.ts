import { UUIDMapper } from '@repo/core/mappers';
import { Hash } from '@repo/crypto';
import { assertSchema } from '@repo/utils';
import * as cbor from 'cbor2';
import { randomUUID } from 'node:crypto';
import { match } from 'ts-pattern';
import z from 'zod';

import { Fmt } from './enums/Fmt';
import { UserVerificationRequirement } from './enums/UserVerificationRequirement';
import { WebAuthnCredentialKeyMetaType } from './enums/WebAuthnCredentialKeyMetaType';
import { CredentialExcluded } from './exceptions/CredentialExcluded';
import { GenerateKeyPairFailed } from './exceptions/GenerateKeyPairFailed';
import { NoSupportedPubKeyCredParamFound } from './exceptions/NoSupportedPubKeyCredParamWasFound';
import { SignatureFailed } from './exceptions/SignatureFailed';
import type { IWebAuthnRepository } from './repositories/IWebAuthnRepository';
import type { IKeyProvider } from './types/IKeyProvider';
import type { WebAuthnCredentialWithMeta } from './types/WebAuthnCredentialWithMeta';
import {
  AuthenticatorGetAssertionArgsSchema,
  type AuthenticatorGetAssertionArgs,
} from './zod-validation/AuthenticatorGetAssertionArgsSchema';
import {
  AuthenticatorMakeCredentialArgsSchema,
  type AuthenticatorMakeCredentialArgs,
} from './zod-validation/AuthenticatorMakeCredentialArgsSchema';
import {
  PubKeyCredParamStrictSchema,
  type PubKeyCredParamLoose,
  type PubKeyCredParamStrict,
} from './zod-validation/PubKeyCredParamSchema';
import { type PublicKeyCredentialCreationOptions } from './zod-validation/PublicKeyCredentialCreationOptionsSchema';
import { type PublicKeyCredentialRequestOptions } from './zod-validation/PublicKeyCredentialRequestOptionsSchema';
import {
  VirtualAuthenticatorCredentialContextArgsSchema,
  type VirtualAuthenticatorCredentialContextArgs,
} from './zod-validation/VirtualAuthenticatorCredentialContextArgsSchema';
import { type VirtualAuthenticatorCredentialMetaArgs } from './zod-validation/VirtualAuthenticatorCredentialMetaArgsSchema';

export type VirtualAuthenticatorCreateCredentialArgs = {
  publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions;
  meta: VirtualAuthenticatorCredentialMetaArgs;
  context: VirtualAuthenticatorCredentialContextArgs;
};

export type VirtualAuthenticatorGetCredentialArgs = {
  publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions;
  meta: VirtualAuthenticatorCredentialMetaArgs;
  context: VirtualAuthenticatorCredentialContextArgs;
};

export type AuthenticatorMakeCredentialPayload = {
  credentialId: Uint8Array;
  attestationObject: Uint8Array;
};

export type AuthenticatorGetAssertionPayload = {
  credentialId: Uint8Array;
  authenticatorData: Uint8Array;
  signature: Uint8Array;
  userHandle: Uint8Array;
};

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
export class VirtualAuthenticator {
  private readonly webAuthnRepository: IWebAuthnRepository;
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
    pubKeyCredParams: PubKeyCredParamLoose[],
  ): PubKeyCredParamStrict {
    for (const pubKeyCredParam of pubKeyCredParams) {
      const result = PubKeyCredParamStrictSchema.safeParse(pubKeyCredParam);
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
    // https://www.w3.org/TR/webauthn-3/#sctn-attested-credential-data
    const attestedCredentialData = Buffer.concat([
      VirtualAuthenticator.AAGUID,
      credentialIdLength,
      credentialID,
      // The credential public key encoded in COSE_Key format, as defined in Section 7 of [RFC8152],
      // using the CTAP2 canonical CBOR encoding form.
      // The COSE_Key-encoded credential public key MUST contain the "alg" parameter
      // and MUST NOT contain any other OPTIONAL parameters.
      // The "alg" parameter MUST contain a COSEAlgorithm value.
      // The encoded credential public key MUST also contain any additional REQUIRED parameters
      // stipulated by the relevant key type specification, i.e., REQUIRED for the key type "kty"
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
    userVerification: UserVerificationRequirement | undefined;

    userVerificationEnabled: boolean;
    userPresenceEnabled: boolean;
  }): Promise<Uint8Array> {
    const {
      rpId,
      counter,
      attestedCredentialData,
      userVerification,
      userVerificationEnabled,
      userPresenceEnabled,
    } = opts;

    // SHA-256 hash of the RP ID the credential is scoped to.
    // Length (in bytes): 32
    const rpIdHash = Hash.sha256(Buffer.from(rpId));

    // Bit 0 (UP - User Present): Result of the user presence test (1 = present, 0 = not present).
    // Bit 1 (RFU1): Reserved for future use.
    // Bit 2 (UV - User Verified): Result of the user verification test (1 = verified, 0 = not verified).
    // Bits 3-5 (RFU2): Reserved for future use.
    // Bit 6 (AT - Attested Credential Data Included): Indicates if attested credential data is included.
    // Bit 7 (ED - Extension data included): Indicates if extension data is included in the authenticator data.
    // Length (in bytes): 1

    let flagsInt = 0b00000000;

    // Bit 0: User Present (UP)
    // Always 1 for standard WebAuthn flows
    if (userPresenceEnabled) {
      flagsInt |= 0b00000001;
    }

    // Bit 2: User Verified (UV)
    // If 'required' or 'preferred' (and not explicitly 'discouraged')
    if (
      userVerificationEnabled &&
      userVerification !== UserVerificationRequirement.DISCOURAGED
    ) {
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
    // https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
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
        //    https://www.w3.org/TR/webauthn-2/#sctn-extensions
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
    authenticatorData: Uint8Array;
  }): Uint8Array {
    const { clientDataHash, authenticatorData } = opts;

    const dataToSign = Buffer.concat([authenticatorData, clientDataHash]);

    return new Uint8Array(dataToSign);
  }

  /**
   * Handles 'none' attestation (no attestation statement).
   * @see https://www.w3.org/TR/webauthn-3/#sctn-none-attestation
   */
  private _handleAttestationNone(): {
    fmt: Fmt;
    attStmt: Map<string, Uint8Array | number>;
  } {
    // https://www.w3.org/TR/webauthn-3/#sctn-attstn-fmt-ids
    const fmt = Fmt.NONE;

    // https://www.w3.org/TR/webauthn-3/#attestation-statement
    const attStmt = new Map<string, Uint8Array | number>([]);

    return {
      fmt,
      attStmt,
    };
  }

  /**
   * Handles 'direct' attestation using packed format.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-packed-attestation
   */
  private async _handleAttestationDirect(opts: {
    webAuthnCredential: WebAuthnCredentialWithMeta;
    data: {
      clientDataHash: Uint8Array;
      authenticatorData: Uint8Array;
    };
  }): Promise<{ fmt: Fmt; attStmt: Map<string, Uint8Array | number> }> {
    const { webAuthnCredential, data } = opts;

    // https://www.w3.org/TR/webauthn-3/#sctn-attstn-fmt-ids
    const fmt = Fmt.PACKED;

    const dataToSign = this._createDataToSign(data);

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

    // https://www.w3.org/TR/webauthn-3/#attestation-statement
    const attStmt = new Map<string, Uint8Array | number>([
      ['alg', alg],
      ['sig', new Uint8Array(signature)],
    ]);

    return {
      fmt,
      attStmt,
    };
  }

  /**
   * The authenticatorMakeCredential operation.
   * This is the authenticator-side operation for creating a new credential.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred
   */
  public async authenticatorMakeCredential(opts: {
    authenticatorMakeCredentialArgs: AuthenticatorMakeCredentialArgs;
    context: VirtualAuthenticatorCredentialContextArgs;
  }): Promise<AuthenticatorMakeCredentialPayload> {
    const { authenticatorMakeCredentialArgs, context } = opts;

    // Step 1: Check if all the supplied parameters are syntactically well-formed and of the correct length
    assertSchema(
      authenticatorMakeCredentialArgs,
      AuthenticatorMakeCredentialArgsSchema,
    );

    assertSchema(context, VirtualAuthenticatorCredentialContextArgsSchema);

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

    // Step 2: Check if at least one of the specified combinations is supported
    const selectedCredTypeAndAlg =
      this._findFirstSupportedCredTypesAndPubKeyAlgsOrThrow(
        credTypesAndPubKeyAlgs,
      );

    // Step 3: For each descriptor of excludeCredentialDescriptorList
    if (
      excludeCredentialDescriptorList &&
      excludeCredentialDescriptorList.length > 0
    ) {
      for (const descriptor of excludeCredentialDescriptorList) {
        let credentialId: string;
        try {
          credentialId = UUIDMapper.bytesToUUID(descriptor.id);
        } catch {
          continue;
        }

        // Step 3.1: If looking up descriptor.id in this authenticator returns non-null
        // Lookup the credential in the authenticator's credential map
        const credentialExists =
          await this.webAuthnRepository.existsByRpIdAndCredentialIds({
            rpId: rpEntity.id,
            credentialIds: [credentialId],
          });

        // If credential exists and the RP ID matches (type matching is implicit as we only store public-key type)
        if (credentialExists) {
          // Step 3.1: Collect an authorization gesture confirming user consent for creating a new credential.
          // The authorization gesture MUST include a test of user presence.
          //
          // NOTE: In this backend authenticator implementation, user consent and presence have already
          // been collected by the agent/client. This backend operates under the assumption that
          // if we reach this point, the user has demonstrated presence (requireUserPresence was checked).
          //
          // Per spec § 6.3.2 step 3.1:
          // - If the user confirms consent to create a new credential → return InvalidStateError
          // - If the user does not consent to create a new credential → return NotAllowedError
          //
          // In our backend context, finding a matching excluded credential means the user has been
          // presented with the situation and has confirmed they want to proceed anyway (which would
          // be unusual). Per spec, this confirmation should result in InvalidStateError.
          throw new CredentialExcluded();
          // 'A credential from the exclude list already exists for this authenticator.',
        }
      }
    }

    // Step 4: If requireResidentKey is true and the authenticator cannot store a client-side discoverable credential
    // This backend authenticator can store credentials, so this check passes
    // If it couldn't, we would: throw new ConstraintError()

    // Step 5: If requireUserVerification is true and the authenticator cannot perform user verification
    // NOTE: This authenticator's capability is determined by the agent/client that calls it.
    // The agent ensures that if requireUserVerification is true, the authenticator can perform UV.
    // We don't have a way to query our own capabilities here, so we trust the agent's validation.

    // Step 6: Collect an authorization gesture confirming user consent
    // NOTE: In this backend authenticator, user consent and presence are assumed to have been
    // collected by the agent/client before this operation is invoked. The requireUserPresence
    // and requireUserVerification parameters indicate what was required.
    //
    // If requireUserPresence is true, the authorization gesture MUST include a test of user presence.
    // If requireUserVerification is true, the authorization gesture MUST include user verification.
    //
    // A real authenticator would:
    // - Display rpEntity.id, rpEntity.name, userEntity.name, userEntity.displayName
    // - Collect user presence (e.g., button press, biometric)
    // - If requireUserVerification is true, perform user verification
    // - If user does not consent → throw NotAllowedError

    // Step 7: Once the authorization gesture has been completed, generate a new credential object
    // Step 7.1: Let (publicKey, privateKey) be a new pair of cryptographic keys using the FIRST supported algorithm
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

    // Step 7.2: Let userHandle be userEntity.id
    const userHandle = UUIDMapper.bytesToUUID(userEntity.id);

    // Step 7.3: Let credentialSource be a new public key credential source with fields:
    // - type: "public-key"
    // - privateKey: privateKey
    // - rpId: rpEntity.id
    // - userHandle: userHandle
    // - otherUI: Any other information the authenticator chooses to include

    // Step 7.4: If requireResidentKey is true or the authenticator chooses to create a client-side discoverable credential:
    // - Let credentialId be a new credential id
    // - Set credentialSource.id to credentialId
    // - Store in authenticator's credentials map
    // Otherwise:
    // - Let credentialId be the result of serializing and encrypting credentialSource
    //
    // In this implementation, we always store credentials in the repository (backend database).
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

    // Step 9: If any error occurred while creating the new credential object
    // (Handled by try-catch in generateKeyPair and repository operations)

    // Step 10: Let the signature counter value for the new credential
    // The counter is initialized in the repository as part of credential creation.
    // Per spec, it can be:
    // - Zero (for U2F devices)
    // - Global signature counter's actual value
    // - Per-credential counter initialized to zero
    // - Constant at zero (if not supported)

    // Step 11: Let attestedCredentialData be the attested credential data byte array
    // including the credentialId and publicKey (created in _createAuthenticatorData)

    // Step 12: Let attestationFormat be the first supported attestation statement format identifier
    // from attestationFormats, taking into account enterpriseAttestationPossible.
    // If attestationFormats contains no supported value, use the most preferred format.
    const selectedAttestationFormat = attestationFormats[0] || 'none';

    const attestedCredentialData = await this._createAttestedCredentialData({
      credentialID: rawCredentialID,
      COSEPublicKey: webAuthnCredentialWithMeta.COSEPublicKey,
    });

    // Step 13: Let authenticatorData be the byte array specified in § 6.1 Authenticator Data
    // including attestedCredentialData and processedExtensions (if any)
    const authenticatorData = await this._createAuthenticatorData({
      rpId: rpEntity.id,
      counter: webAuthnCredentialWithMeta.counter,
      attestedCredentialData,

      userVerification: requireUserVerification
        ? UserVerificationRequirement.REQUIRED
        : UserVerificationRequirement.DISCOURAGED,

      userVerificationEnabled: requireUserVerification,
      userPresenceEnabled: requireUserPresence,
    });

    // Step 14: Create an attestation object for the new credential using the procedure
    // specified in § 6.5.4 Generating an Attestation Object
    let fmt: Fmt;
    let attStmt: Map<string, Uint8Array | number>;

    switch (selectedAttestationFormat) {
      case 'none':
        ({ fmt, attStmt } = this._handleAttestationNone());
        break;
      case 'packed':
        ({ fmt, attStmt } = await this._handleAttestationDirect({
          webAuthnCredential: webAuthnCredentialWithMeta,
          data: { clientDataHash: hash, authenticatorData },
        }));
        break;
      default:
        // Unsupported format, fall back to 'none'
        ({ fmt, attStmt } = this._handleAttestationNone());
        break;
    }

    const attestationObject = new Map<string, unknown>([
      ['fmt', fmt],
      ['attStmt', attStmt],
      ['authData', authenticatorData],
    ]);

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
    context: VirtualAuthenticatorCredentialContextArgs;
    userId: string;
  }): Promise<AuthenticatorGetAssertionPayload> {
    const { authenticatorGetAssertionArgs, context, userId } = opts;

    // Step 1: Check if all the supplied parameters are syntactically well-formed and of the correct length
    assertSchema(
      authenticatorGetAssertionArgs,
      AuthenticatorGetAssertionArgsSchema,
    );

    assertSchema(context, VirtualAuthenticatorCredentialContextArgsSchema);

    const {
      hash,
      rpId,
      allowCredentialDescriptorList,
      requireUserPresence,
      requireUserVerification,
      // extensions,
    } = authenticatorGetAssertionArgs;

    // Step 2 - Step 7 + Step 9:
    const webAuthnCredential =
      await this.webAuthnRepository.findFirstAndIncrementCounterAtomicallyOrThrow(
        {
          userId,
          rpId,
          apiKeyId: context.apiKeyId,
          allowCredentialDescriptorList: allowCredentialDescriptorList?.map(
            (allowCredentialDescriptor) =>
              UUIDMapper.bytesToUUID(allowCredentialDescriptor.id),
          ),
        },
      );

    const credentialId = UUIDMapper.UUIDtoBytes(webAuthnCredential.id);

    // Step 8: Let processedExtensions be the result of authenticator extension processing for each supported extension identifier → authenticator extension input in extensions.
    // NOTE: Skipped

    // Step 10: Create authenticatorData
    const authenticatorData = await this._createAuthenticatorData({
      attestedCredentialData: undefined,
      rpId,
      counter: webAuthnCredential.counter,
      userVerification: requireUserVerification
        ? UserVerificationRequirement.REQUIRED
        : UserVerificationRequirement.DISCOURAGED,
      userVerificationEnabled: requireUserVerification,
      userPresenceEnabled: requireUserPresence,
    });

    // Step 11:
    const dataToSign = this._createDataToSign({
      clientDataHash: hash,
      authenticatorData,
    });

    const { signature } = await this.keyProvider
      .sign({
        data: dataToSign,
        webAuthnCredential,
      })
      .catch((error) => {
        // Step 12: If any error occurred while generating the assertion signature, return an error code equivalent to "UnknownError" and terminate the operation.
        throw new SignatureFailed({
          cause: error,
        });
      });

    const userHandleBytes = UUIDMapper.UUIDtoBytes(webAuthnCredential.userId);

    // Step 13: Return to the user agent:
    // selectedCredential.id, if either a list of credentials (i.e., allowCredentialDescriptorList) of length 2 or greater was supplied by the client, or no such list was supplied.
    // Note: If, within allowCredentialDescriptorList, the client supplied exactly one credential and it was successfully employed, then its credential ID is not returned since the client already knows it. This saves transmitting these bytes over what may be a constrained connection in what is likely a common case.
    // authenticatorData
    // signature
    // selectedCredential.userHandle
    return {
      credentialId,
      authenticatorData,
      signature: new Uint8Array(signature),
      userHandle: userHandleBytes,
    };
  }
}
