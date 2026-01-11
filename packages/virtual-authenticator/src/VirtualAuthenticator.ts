import { assertSchema } from '@repo/assert';
import * as cbor from '@repo/cbor';
import { UUIDMapper } from '@repo/core/mappers';
import { Hash, HashOnion } from '@repo/crypto';
import type { Uint8Array_ } from '@repo/types';
import { randomUUID } from 'node:crypto';
import { match } from 'ts-pattern';
import z from 'zod';

import type { IAuthenticator } from './IAuthenticator';
import type { AttestationObjectMap, AttestationStatementMap } from './cbor';
import { AuthenticatorGetAssertionArgsDtoSchema } from './dto/authenticator/AuthenticatorGetAssertionArgsDtoSchema';
import { AuthenticatorMakeCredentialArgsDtoSchema } from './dto/authenticator/AuthenticatorMakeCredentialArgsDtoSchema';
import { Fmt } from './enums/Fmt';
import { WebAuthnPublicKeyCredentialKeyMetaType } from './enums/WebAuthnPublicKeyCredentialKeyMetaType';
import { UserVerificationNotAvailable } from './exceptions';
import { CredentialExcluded } from './exceptions/CredentialExcluded';
import { CredentialOptionsEmpty } from './exceptions/CredentialOptionsEmpty';
import { CredentialSelectException } from './exceptions/CredentialSelectException';
import { CredentialTypesNotSupported } from './exceptions/CredentialTypesNotSupported';
import { GenerateKeyPairFailed } from './exceptions/GenerateKeyPairFailed';
import { SignatureFailed } from './exceptions/SignatureFailed';
import { UserPresenceNotAvailable } from './exceptions/UserPresenceNotAvailable';
import type { IWebAuthnRepository } from './repositories/IWebAuthnRepository';
import type { IKeyProvider } from './types/IKeyProvider';
import type { WebAuthnPublicKeyCredentialWithMeta } from './types/WebAuthnPublicKeyCredentialWithMeta';
import {
  AuthenticatorContextArgsSchema,
  type AuthenticatorContextArgs,
} from './validation/authenticator/AuthenticatorContextArgsSchema';
import {
  AuthenticatorGetAssertionArgsSchema,
  type AuthenticatorGetAssertionArgs,
} from './validation/authenticator/AuthenticatorGetAssertionArgsSchema';
import {
  AuthenticatorGetAssertionResponseSchema,
  type AuthenticatorGetAssertionResponse,
} from './validation/authenticator/AuthenticatorGetAssertionResponseSchema';
import {
  AuthenticatorMakeCredentialArgsSchema,
  type AuthenticatorMakeCredentialArgs,
} from './validation/authenticator/AuthenticatorMakeCredentialArgsSchema';
import {
  AuthenticatorMakeCredentialResponseSchema,
  type AuthenticatorMakeCredentialResponse,
} from './validation/authenticator/AuthenticatorMakeCredentialResponseSchema';
import {
  AuthenticatorMetaArgsSchema,
  type AuthenticatorMetaArgs,
} from './validation/authenticator/AuthenticatorMetaArgsSchema';
import {
  SupportedPubKeyCredParamSchema,
  type PubKeyCredParam,
  type SupportedPubKeyCredParam,
} from './validation/spec/CredParamSchema';

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
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-automation-virtual-authenticators
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

  /**
   * @see https://www.w3.org/TR/webauthn-3/#attestation-statement-format-identifier
   */
  static readonly SUPPORTED_ATTESTATION_FORMATS: string[] = [
    Fmt.NONE,
    Fmt.PACKED,
  ];

  static readonly MOST_PREFFERED_ATTESTATION_FORMAT = Fmt.NONE;

  /**
   * Finds and returns the first supported public key credential parameter from a given list.
   *
   * This function iterates through an array of `PubKeyCredParamLoose` objects and returns the
   * first one that successfully validates against the `PubKeyCredParamStrictSchema`.
   *
   * @param {PubKeyCredParamLoose[]} pubKeyCredParams - An array of public key credential parameters to check.
   * @returns {PubKeyCredParamStrict} The first parameter from the array that is supported (passes strict validation).
   */
  private _findFirstSupportedCredTypesAndPubKeyAlgOrNull(
    pubKeyCredParams: PubKeyCredParam[],
  ): SupportedPubKeyCredParam | null {
    for (const pubKeyCredParam of pubKeyCredParams) {
      const result = SupportedPubKeyCredParamSchema.safeParse(pubKeyCredParam);
      if (result.success) {
        return result.data;
      }
    }

    return null;
  }

  /**
   * Creates attested credential data structure.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-attested-credential-data
   */
  private async _createAttestedCredentialData(opts: {
    credentialId: Uint8Array_;
    COSEPublicKey: Uint8Array_;
  }): Promise<Uint8Array_> {
    const { credentialId, COSEPublicKey } = opts;

    // Byte length L of Credential ID, 16-bit unsigned big-endian integer.
    // Length (in bytes): 2
    const credentialIdLength = Buffer.alloc(2);
    credentialIdLength.writeUInt16BE(opts.credentialId.length, 0);

    // Attested credential data: variable-length byte array for attestation object.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-attested-credential-data
    const attestedCredentialData = Buffer.concat([
      VirtualAuthenticator.AAGUID,
      credentialIdLength,
      credentialId,
      // The credential public key encoded in COSEKey format, as defined using the CTAP2 canonical CBOR encoding form.
      // The COSEKey-encoded credential public key MUST contain the "alg" parameter
      // and MUST NOT contain any other OPTIONAL parameters.
      // The "alg" parameter MUST contain a COSEAlgorithm value.
      // The encoded credential public key MUST also contain any
      // additional REQUIRED parameters
      // stipulated by the relevant key type specification, i.e., REQUIRED for the key type "kty" and algorithm "alg" (see Section 8 of https://datatracker.ietf.org/doc/html/rfc8152).
      // Length (in bytes): L
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
    attestedCredentialData: Uint8Array_ | undefined;
    requireUserVerification: boolean;
    userVerificationEnabled: boolean;
    userPresenceEnabled: boolean;
  }): Promise<Uint8Array_> {
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
    // @see https://www.w3.org/TR/webauthn-3/#concept-user-present
    // Bit 1 (RFU1): Reserved for future use.
    // Bit 2 (UV - User Verified): Result of the user verification test
    // (1 = verified, 0 = not verified).
    // @see https://www.w3.org/TR/webauthn-3/#concept-user-verified
    // Bit 3 (BE - Backup Eligibility): Indicates if the credential is
    // eligible for backup/sync (1 = eligible, 0 = not eligible).
    // @see https://www.w3.org/TR/webauthn-3/#backup-eligibility
    // Bit 4 (BS - Backup State): Indicates if the credential is
    // currently backed up (1 = backed up, 0 = not backed up).
    // @see https://www.w3.org/TR/webauthn-3/#backup-state
    // Bit 5 (RFU2): Reserved for future use.
    // Bit 6 (AT - Attested Credential Data Included): Indicates if
    // attested credential data is included.
    // @see https://www.w3.org/TR/webauthn-3/#attested-credential-data
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
    const shouldSetUserVerifiedFlag =
      userVerificationEnabled && requireUserVerification;
    if (shouldSetUserVerifiedFlag) {
      flagsInt |= 0b00000100;
    }

    // BE and BS bits
    // The value of the BE flag is set during authenticatorMakeCredential operation and MUST NOT change.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-credential-backup
    // BE=0, BS=0: Single-device credential.
    //   (e.g., A hardware key or TPM where the key never leaves the chip).
    //
    // BE=0, BS=1: INVALID / NOT ALLOWED.
    //   (A credential cannot be "backed up" if it is not marked "eligible").
    //
    // BE=1, BS=0: Multi-device credential (Passkey), but NOT currently backed up.
    //   (Sync is possible/supported, but currently disabled or inactive).
    //
    // BE=1, BS=1: Multi-device credential (Passkey) and currently backed up.
    //   (The key is synced to the cloud/database and safe from device loss).

    // Bit 3: (BE - Backup Eligibility)
    // Backup eligibility is a credential property and is permanent for a given public key credential source.
    // A backup eligible public key credential source is referred to as a multi-device credential
    // whereas one that is not backup eligible is referred to as a single-device credential.
    // NOTE: We set the 'Backup Eligibility' (BE) flag to 1.
    // Since credentials are stored in a central database rather than
    // on a specific device, they are effectively synced and recoverable.
    flagsInt |= 0b00001000;

    // Bit 4: (BS - Backup State)
    // Public Key Credential Sources may be backed up in some fashion such that they may become
    // present on an authenticator other than their generating authenticator.
    // Backup can occur via mechanisms including but not limited to peer-to-peer sync, cloud sync, local network sync, and manual import/export.
    // NOTE: We set this to 1 because the credential is immediately stored in a central
    // database (cloud), meaning it is already "backed up" and safe from device loss.
    flagsInt |= 0b00010000;

    // Bit 6: Attested Credential Data (AT)
    // Only set if we are creating a new credential (registration),
    // indicated by the presence of credentialId
    if (attestedCredentialData) {
      flagsInt |= 0b01000000;
    }

    // Bit 7: Extension data included
    // NOTE: Extension data is never included.

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
        //    This is a CBOR map with extension identifiers as keys,
        //    and authenticator extension outputs as values.
        // )
      ].filter((value) => {
        // Non defined values should be ommited.
        return value !== undefined;
      }),
    );

    return new Uint8Array(authenticatorData);
  }

  /**
   * Creates data to be signed: concatenation of authData and clientDataHash.
   * signature = Sign(privateKey, authenticatorData || clientDataHash)
   *
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion (Step 11)
   */
  private _createDataToSign(opts: {
    clientDataHash: Uint8Array_;
    authData: Uint8Array_;
  }): Uint8Array_ {
    const { clientDataHash, authData } = opts;

    const dataToSign = Buffer.concat([authData, clientDataHash]);

    return new Uint8Array(dataToSign);
  }

  /**
   * Handles 'none' attestation (no attestation statement).
   * @see https://www.w3.org/TR/webauthn-3/#sctn-none-attestation
   */
  private _handleAttestationNone(): AttestationStatementMap {
    // For "none" attestation, the attestation statement is an empty CBOR map
    const attStmt = new Map<never, never>();

    return attStmt;
  }

  /**
   * Handles 'packed' attestation using self-attestation.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-packed-attestation
   */
  private async _handleAttestationPacked(opts: {
    webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta;
    data: {
      clientDataHash: Uint8Array_;
      authData: Uint8Array_;
    };
  }): Promise<AttestationStatementMap> {
    const { webAuthnPublicKeyCredential, data } = opts;

    const dataToSign = this._createDataToSign(data);

    // Sign the data to create the attestation signature
    const { signature, alg } = await this.keyProvider
      .sign({
        data: dataToSign,
        webAuthnPublicKeyCredential,
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
    ]) as AttestationStatementMap;

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
   * @returns The first supported format, or the most preferred format if none are supported
   */
  private _findFirstSupportedAttestationFormat(opts: {
    attestationFormats: string[];
    // NOTE: Not used, as enterprise attestation is not supported.
    enterpriseAttestationPossible: boolean;
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

    // If no supported format found, return the most preferred format
    return (
      (firstSupportedAttestationFormat as Fmt) ??
      VirtualAuthenticator.MOST_PREFFERED_ATTESTATION_FORMAT
    );
  }

  /**
   * @see https://www.w3.org/TR/webauthn-3/#sctn-generating-an-attestation-object
   */
  private async _generateAttestationObject(opts: {
    webAuthnPublicKeyCredential: WebAuthnPublicKeyCredentialWithMeta;

    attestationFormat: Fmt;
    authData: Uint8Array_;
    hash: Uint8Array_;
  }): Promise<AttestationObjectMap> {
    const { webAuthnPublicKeyCredential, attestationFormat, authData, hash } =
      opts;

    let attStmt: AttestationStatementMap;

    switch (attestationFormat) {
      case Fmt.NONE:
        // For "none" attestation, create empty attestation statement
        attStmt = this._handleAttestationNone();
        break;
      case Fmt.PACKED:
        // For "packed" attestation, create self-attestation with signature
        attStmt = await this._handleAttestationPacked({
          webAuthnPublicKeyCredential,
          data: { clientDataHash: hash, authData },
        });
        break;
      default:
        throw new Error('Unsupported attestation format is used.');
    }

    const attestationObjectMap = new Map<string, unknown>([
      ['fmt', attestationFormat],
      ['attStmt', attStmt],
      ['authData', authData],
    ]) as AttestationObjectMap;

    return attestationObjectMap;
  }

  private _hashAuthenticatorMakeCredentialOptionsAsHex(opts: {
    authenticatorMakeCredentialArgs: AuthenticatorMakeCredentialArgs;
    meta: AuthenticatorMetaArgs;
  }): string {
    const { authenticatorMakeCredentialArgs, meta } = opts;

    return Hash.sha256JSONHex({
      authenticatorMakeCredentialArgs:
        AuthenticatorMakeCredentialArgsDtoSchema.encode(
          authenticatorMakeCredentialArgs,
        ),
      meta,
    });
  }

  /**
   * The authenticatorMakeCredential operation.
   * This is the authenticator-side operation for creating a new credential.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred
   * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#authenticatorMakeCredential
   */
  public async authenticatorMakeCredential(opts: {
    authenticatorMakeCredentialArgs: AuthenticatorMakeCredentialArgs;
    meta: AuthenticatorMetaArgs;
    context: AuthenticatorContextArgs;
  }): Promise<AuthenticatorMakeCredentialResponse> {
    const { authenticatorMakeCredentialArgs, meta, context } = opts;

    // Step 1: Check if all the supplied parameters are syntactically well-formed and of the correct length.
    // If not, return an error code equivalent to "UnknownError" and terminate the operation.
    assertSchema(
      authenticatorMakeCredentialArgs,
      AuthenticatorMakeCredentialArgsSchema,
    );

    // Meta validation
    assertSchema(
      meta,
      AuthenticatorMetaArgsSchema.extend({
        userPresenceEnabled: z.literal(true),
      }),
    );
    // Context validation
    assertSchema(context, AuthenticatorContextArgsSchema);

    const {
      hash,
      rpEntity,
      userEntity,

      // NOTE: This virtual authenticator always create client-side discoverable credential as the private key cannot leave Key Vault.
      // Discoverable (Resident Key): Private key stored in Authenticator database - Key Vault in this implementation.
      // requireResidentKey,

      // NOTE: Should be always true. Just for compatibility with spec.
      // requireUserPresence,

      requireUserVerification,
      credTypesAndPubKeyAlgs,

      enterpriseAttestationPossible,

      attestationFormats,
      excludeCredentialDescriptorList,

      // NOTE: Extensions are not implemented.
      // extensions,
    } = authenticatorMakeCredentialArgs;

    // Step 2: Check if at least one of the specified combinations of
    // PublicKeyCredentialType and cryptographic parameters in
    // credTypesAndPubKeyAlgs is supported.
    const selectedCredTypeAndAlg =
      this._findFirstSupportedCredTypesAndPubKeyAlgOrNull(
        credTypesAndPubKeyAlgs,
      );

    // If not, return an error code equivalent to "NotSupportedError" and
    // terminate the operation.
    if (selectedCredTypeAndAlg === null) {
      throw new CredentialTypesNotSupported();
    }

    // Step 3: For each descriptor of excludeCredentialDescriptorList:
    if (
      excludeCredentialDescriptorList &&
      excludeCredentialDescriptorList.length > 0
    ) {
      const credentialIds = excludeCredentialDescriptorList
        .map((excludeCredentialDescriptor) =>
          UUIDMapper.tryBytesToUUID(excludeCredentialDescriptor.id),
        )
        .filter(
          (excludeCredentialDescriptorId) =>
            excludeCredentialDescriptorId !== null,
        );

      // Step 3.1: If looking up descriptor.id in this authenticator returns non-null:
      // Collect an authorization gesture confirming user consent for creating a new credential.
      // The authorization gesture MUST include a test of user presence.
      // If the user confirms consent to create a new credential, return an error code equivalent to "InvalidStateError" and terminate the operation.
      // If the user does not consent to create a new credential, return an error code equivalent to "NotAllowedError" and terminate the operation.
      // NOTE: In this backend authenticator implementation, user consent and presence is not implemented.
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
    // NOTE: This virtual authenticator can store client-side discoverable credential.
    // NOTE: Implemented without need to check.

    // Step 5: If requireUserVerification is true and the authenticator cannot perform user verification,
    // return an error code equivalent to "ConstraintError" and terminate the operation.
    if (
      requireUserVerification === true &&
      meta.userVerificationEnabled === false
    ) {
      throw new UserVerificationNotAvailable();
    }

    // Step 6: Collect an authorization gesture confirming user consent for creating a new credential.
    // The authorization gesture MUST include a test of user presence.
    // If requireUserVerification is true, the authorization gesture MUST include user verification.
    // If requireUserPresence is true, the authorization gesture MUST include a test of user presence.
    // If the user does not consent, return an error code equivalent to "NotAllowedError" and terminate the operation.
    // NOTE: Not implemented.

    // Step 7: Once the authorization gesture has been completed, generate
    // a new credential object
    // Step 7.1: Let (publicKey, privateKey) be a new pair of cryptographic
    // keys using the FIRST supported algorithm
    const webAuthnPublicKeyCredentialId = randomUUID();
    const rawCredentialId = UUIDMapper.UUIDtoBytes(
      webAuthnPublicKeyCredentialId,
    );

    const webAuthnPublicKeyCredentialPublicKey = await this.keyProvider
      .generateKeyPair({
        webAuthnPublicKeyCredentialId,
        pubKeyCredParams: selectedCredTypeAndAlg,
      })
      .catch((error) => {
        throw new GenerateKeyPairFailed({ cause: error });
      });

    assertSchema(
      webAuthnPublicKeyCredentialPublicKey.webAuthnPublicKeyCredentialKeyMetaType,
      z.enum(WebAuthnPublicKeyCredentialKeyMetaType),
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

    // Step 7.4:
    // If requireResidentKey is true or the authenticator chooses to create a client-side discoverable credential:
    //    Let credentialId be a new credential id.
    //    Set credentialSource.id to credentialId.
    //    Store credentialSource in the authenticator.
    // Otherwise:
    //    Let credentialId be the result of serializing and encrypting credentialSource.
    // NOTE: This virtual authenticator always create client-side discoverable credential as the private key cannot leave Key Vault.
    // Discoverable (Resident Key): Private key stored in Authenticator database - Key Vault in this implementation.
    // Non-Discoverable (Non-Resident Key): Private key stored on RP Server databse (as an encrypted blob) - Not in this implementation.
    // CONCLUSION: Authenticator always chooses to create client-side discoverable credential.
    const webAuthnPublicKeyCredentialWithMeta = await match({
      webAuthnPublicKeyCredentialKeyMetaType:
        webAuthnPublicKeyCredentialPublicKey.webAuthnPublicKeyCredentialKeyMetaType,
    })
      .returnType<Promise<WebAuthnPublicKeyCredentialWithMeta>>()
      .with(
        {
          webAuthnPublicKeyCredentialKeyMetaType:
            WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
        },
        async () => {
          const webAuthnPublicKeyCredentialWithKeyVaultMeta =
            await this.webAuthnRepository.createKeyVaultWebAuthnPublicKeyCredential(
              {
                id: webAuthnPublicKeyCredentialId,
                name: userEntity.displayName,
                webAuthnPublicKeyCredentialKeyVaultKeyMeta:
                  webAuthnPublicKeyCredentialPublicKey.webAuthnPublicKeyCredentialKeyVaultKeyMeta,
                COSEPublicKey:
                  webAuthnPublicKeyCredentialPublicKey.COSEPublicKey,
                rpId: rpEntity.id,
                userId: userHandle,
                apiKeyId: meta.apiKeyId,
                isClientSideDiscoverable: true,
              },
            );

          return webAuthnPublicKeyCredentialWithKeyVaultMeta;
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
    // NOTE: Virtual authenticator supports Per-credential counter initialized to zero.
    // The Per-credential counter is initialized in the repository as part of credential creation.

    // Step 11: Let attestedCredentialData be the attested credential data byte array including:
    // The authenticator's AAGUID.
    // The length of credentialId (2 bytes, big-endian).
    // credentialId.
    // The credential public key encoded in COSE_Key format.
    const attestedCredentialData = await this._createAttestedCredentialData({
      credentialId: rawCredentialId,
      COSEPublicKey: webAuthnPublicKeyCredentialWithMeta.COSEPublicKey,
    });

    // Step 12: Let attestationFormat be the first supported attestation
    // statement format identifier from attestationFormats, taking into
    // account enterpriseAttestationPossible.
    // If attestationFormats contains no supported value, use the most
    // preferred format.
    const attestationFormat = this._findFirstSupportedAttestationFormat({
      attestationFormats,
      enterpriseAttestationPossible: enterpriseAttestationPossible ?? false,
    });

    // Step 13: Let authenticatorData be the byte array specified in §6.1
    // Authenticator Data including attestedCredentialData and
    // processedExtensions (if any) as the extensions.
    const authenticatorData = await this._createAuthenticatorData({
      rpId: rpEntity.id,
      counter: webAuthnPublicKeyCredentialWithMeta.counter,
      attestedCredentialData,
      requireUserVerification,
      // Virtual authenticator is always capable of user verification and user presence
      userVerificationEnabled: true,
      userPresenceEnabled: true,
    });

    // Step 14: Create an attestation object for the new credential using
    // the procedure specified in §6.5.4 Generating an Attestation Object.
    const attestationObject = await this._generateAttestationObject({
      webAuthnPublicKeyCredential: webAuthnPublicKeyCredentialWithMeta,

      attestationFormat,
      hash,
      authData: authenticatorData,
    });

    const attestationObjectCborEncoded = cbor.encode(attestationObject);

    // Return the attestation object to the client
    const authenticatorMakeCredentialResponse = {
      credentialId: rawCredentialId,
      attestationObject: attestationObjectCborEncoded,
    };

    assertSchema(
      authenticatorMakeCredentialResponse,
      AuthenticatorMakeCredentialResponseSchema,
    );

    return authenticatorMakeCredentialResponse;
  }

  private _hashAuthenticatorGetAssertionOptionsAsHex(opts: {
    authenticatorGetAssertionArgs: AuthenticatorGetAssertionArgs;
    meta: AuthenticatorMetaArgs;
  }): string {
    const { authenticatorGetAssertionArgs, meta } = opts;

    return Hash.sha256JSONHex({
      authenticatorGetAssertionArgs:
        AuthenticatorGetAssertionArgsDtoSchema.encode(
          authenticatorGetAssertionArgs,
        ),
      meta,
    });
  }

  /**
   * The authenticatorGetAssertion operation.
   * This is the authenticator-side operation for generating an assertion.
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
   * @see https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html#authenticatorGetAssertion
   */
  public async authenticatorGetAssertion(opts: {
    authenticatorGetAssertionArgs: AuthenticatorGetAssertionArgs;
    meta: AuthenticatorMetaArgs;
    context: AuthenticatorContextArgs;
  }): Promise<AuthenticatorGetAssertionResponse> {
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

    const optionsHash = this._hashAuthenticatorGetAssertionOptionsAsHex({
      authenticatorGetAssertionArgs,
      meta,
    });

    // Context hash validation
    assertSchema(opts.context?.hash, z.literal(optionsHash).optional());

    const {
      hash,
      rpId,
      allowCredentialDescriptorList,

      requireUserPresence,
      requireUserVerification,

      // NOTE: Extensions are not implemented.
      // extensions,
    } = authenticatorGetAssertionArgs;

    // Step 2: Let credentialOptions be a new empty set of public key credential sources.
    // NOTE: Implemented below as a part of next steps.

    // Step 3: If allowCredentialDescriptorList was supplied, then for each descriptor of allowCredentialDescriptorList:
    //   If allowCredentialDescriptorList was supplied:
    //     For each descriptor of allowCredentialDescriptorList:
    //       Let credSource be the result of looking up descriptor.id in this authenticator.
    //       If credSource is not null, append it to credentialOptions.
    // Step 4: Otherwise (allowCredentialDescriptorList was not supplied):
    //     For each key → credSource of this authenticator's credentials map, append credSource to credentialOptions.
    // NOTE: Implemented via repository query with optional allowCredentialDescriptorList filter.

    // NOTE: All credentials created by this authenticator are client-side discoverable!
    // This virtual authenticator always create client-side discoverable credential as the private key cannot leave Key Vault.
    // Discoverable (Resident Key): Private key stored in Authenticator database - Key Vault in this implementation.
    // Non-Discoverable (Non-Resident Key): Private key stored on RP Server databse (as an encrypted blob) - Not in this implementation.
    // @see https://www.w3.org/TR/webauthn-3/#client-side-discoverable-credential
    // A discoverable credential capable authenticator can generate an assertion signature for
    // a discoverable credential given only an RP ID, which in turn necessitates that the public key credential source is stored in the authenticator or client platform.
    // @see https://www.w3.org/TR/webauthn-3/#server-side-credential
    // Client-side storage of the public key credential source is not required for a server-side credential.

    // Step 5: Filter by rpId
    //   Remove any items from credentialOptions whose rpId is not equal to rpId.
    //   NOTE: Implemented as part of the repository query filter.
    let credentialOptions =
      await this.webAuthnRepository.findAllApplicableCredentialsByRpIdAndUserWithAllowCredentialDescriptorList(
        {
          userId: meta.userId,
          rpId,
          apiKeyId: meta.apiKeyId,
          allowCredentialDescriptorList: allowCredentialDescriptorList?.map(
            (allowCredentialDescriptor) =>
              UUIDMapper.bytesToUUID(allowCredentialDescriptor.id),
          ),
        },
      );

    if (context?.selectedCredentailOptionId !== undefined) {
      credentialOptions = credentialOptions.filter((credentialOption) => {
        return credentialOption.id === context?.selectedCredentailOptionId;
      });
    }

    // Step 6: Check if credentialOptions is empty
    //   If credentialOptions is now empty, return an error code equivalent to "NotAllowedError" and terminate the operation.
    if (credentialOptions.length === 0) {
      throw new CredentialOptionsEmpty();
    }

    // Step 7: Prompt user to select credential and collect authorization gesture
    // Prompt the user to select a public key credential source selectedCredential from credentialOptions.

    // Prompt user to select credential.
    if (credentialOptions.length > 1) {
      throw new CredentialSelectException({
        credentialOptions,
        hash: HashOnion.push(optionsHash),
      });
    }

    // Collect an authorization gesture confirming user consent for using selectedCredential.
    // If requireUserVerification is true, the authorization gesture MUST include user verification.
    if (
      requireUserVerification === true &&
      meta.userVerificationEnabled === false
    ) {
      throw new UserVerificationNotAvailable();
    }

    // If requireUserPresence is true, the authorization gesture MUST include a test of user presence.
    if (requireUserPresence === true && meta.userPresenceEnabled === false) {
      throw new UserPresenceNotAvailable();
    }
    // If the user does not consent, return an error code equivalent to "NotAllowedError" and terminate the operation.

    // IMPORTANT: The credential is selected ONLY if there is only one credential.
    const selectedCredential = credentialOptions[0]!;

    // Step 8: Let processedExtensions be the result of authenticator extension processing for each supported extension identifier → authenticator extension input in extensions.
    // NOTE: Extension processing is skipped.

    // Step 9: Increment signature counter
    //   Increment the credential associated signature counter or the global signature counter value,
    //   depending on which approach is implemented by the authenticator, by some positive value.
    //   If the authenticator does not implement a signature counter, let the signature counter value remain constant at zero.
    //   NOTE: Implemented atomically in the repository operation to prevent race conditions.
    //   The counter is incremented by 1 for each assertion operation.
    const webAuthnPublicKeyCredentialWithMeta =
      await this.webAuthnRepository.incrementCounter({
        credentialId: selectedCredential.id,
      });

    // Step 10: Let authenticatorData be the byte array specified in §6.1 Authenticator Data
    // including processedExtensions, if any, as the extensions
    // and excluding attestedCredentialData.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
    const authenticatorData = await this._createAuthenticatorData({
      // IMPORTANT: exlude attestedCredentialData
      attestedCredentialData: undefined,
      rpId,
      counter: webAuthnPublicKeyCredentialWithMeta.counter,
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
        webAuthnPublicKeyCredential: webAuthnPublicKeyCredentialWithMeta,
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

    const credentialId = UUIDMapper.UUIDtoBytes(
      webAuthnPublicKeyCredentialWithMeta.id,
    );
    const userHandle = UUIDMapper.UUIDtoBytes(
      webAuthnPublicKeyCredentialWithMeta.userId,
    );

    const authenticatorGetAssertionResponse: AuthenticatorGetAssertionResponse =
      {
        credentialId,
        authenticatorData,
        signature,
        userHandle,
      };

    assertSchema(
      authenticatorGetAssertionResponse,
      AuthenticatorGetAssertionResponseSchema,
    );

    return authenticatorGetAssertionResponse;
  }

  public async authenticatorCancel() {
    // NOTE: Not implemented.
  }
}
