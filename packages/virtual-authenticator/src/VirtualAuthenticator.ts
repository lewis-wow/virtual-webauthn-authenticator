import { UUIDMapper } from '@repo/core/mappers';
import { OriginSchema } from '@repo/core/zod-validation';
import { Hash } from '@repo/crypto';
import { assertSchema } from '@repo/utils';
import * as cbor from 'cbor2';
import { randomUUID } from 'node:crypto';
import { match } from 'ts-pattern';
import z from 'zod';

import { Attestation } from './enums/Attestation';
import { Fmt } from './enums/Fmt';
import { PublicKeyCredentialType } from './enums/PublicKeyCredentialType';
import { UserVerificationRequirement } from './enums/UserVerificationRequirement';
import { WebAuthnCredentialKeyMetaType } from './enums/WebAuthnCredentialKeyMetaType';
import { AttestationNotSupported } from './exceptions/AttestationNotSupported';
import { CredentialExcluded } from './exceptions/CredentialExcluded';
import { GenerateKeyPairFailed } from './exceptions/GenerateKeyPairFailed';
import { NoSupportedPubKeyCredParamFound } from './exceptions/NoSupportedPubKeyCredParamWasFound';
import { SignatureFailed } from './exceptions/SignatureFailed';
import { UserVerificationNotAvailable } from './exceptions/UserVerificationNotAvailable';
import type { IWebAuthnRepository } from './repositories/IWebAuthnRepository';
import type { IKeyProvider } from './types/IKeyProvider';
import type { WebAuthnCredentialWithMeta } from './types/WebAuthnCredentialWithMeta';
import type { CollectedClientData } from './zod-validation/CollectedClientDataSchema';
import {
  PubKeyCredParamStrictSchema,
  type PubKeyCredParamLoose,
  type PubKeyCredParamStrict,
} from './zod-validation/PubKeyCredParamSchema';
import {
  PublicKeyCredentialCreationOptionsSchema,
  type PublicKeyCredentialCreationOptions,
} from './zod-validation/PublicKeyCredentialCreationOptionsSchema';
import {
  PublicKeyCredentialRequestOptionsSchema,
  type PublicKeyCredentialRequestOptions,
} from './zod-validation/PublicKeyCredentialRequestOptionsSchema';
import type { PublicKeyCredential } from './zod-validation/PublicKeyCredentialSchema';

export type VirtualAuthenticatorCredentialMetaArgs = {
  origin: string;
  userId: string;

  userVerificationEnabled?: boolean;
  userPresenceEnabled?: boolean;
  crossOrigin?: boolean;
};

export type VirtualAuthenticatorCredentialContextArgs = {
  apiKeyId: string | null;
};

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
  private _findFirstSupportedPubKeyCredParamsOrThrow(
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
    /**
     * Should be only set if we are creating a new credential (registration).
     */
    credentialID: Uint8Array | undefined;
    COSEPublicKey: Uint8Array;
    userVerification: UserVerificationRequirement | undefined;

    userVerificationEnabled: boolean;
    userPresenceEnabled: boolean;
  }): Promise<Uint8Array> {
    const {
      rpId,
      counter,
      credentialID,
      COSEPublicKey,
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
    if (credentialID) {
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
        credentialID
          ? await this._createAttestedCredentialData({
              credentialID,
              COSEPublicKey,
            })
          : undefined,
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
    clientDataJSON: Uint8Array;
    authData: Uint8Array;
  }): Uint8Array {
    const { clientDataJSON, authData } = opts;
    const clientDataHash = Hash.sha256(clientDataJSON);

    const dataToSign = Buffer.concat([authData, clientDataHash]);

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
      clientDataJSON: Uint8Array;
      authData: Uint8Array;
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
   * Creates a new public key credential (registration ceremony).
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential
   */
  public async createCredential(
    opts: VirtualAuthenticatorCreateCredentialArgs,
  ): Promise<PublicKeyCredential> {
    const { publicKeyCredentialCreationOptions, meta, context } = opts;

    assertSchema(
      publicKeyCredentialCreationOptions,
      PublicKeyCredentialCreationOptionsSchema,
    );

    assertSchema(
      meta,
      z.object({
        origin: OriginSchema,
        userId: z.literal(
          UUIDMapper.bytesToUUID(publicKeyCredentialCreationOptions.user.id),
        ),
        userVerificationEnabled: z.boolean().optional(),
        userPresenceEnabled: z.boolean().optional(),
        crossOrigin: z.boolean().optional(),
      }),
    );

    // Validate that the origin is authorized to act on behalf of the RP ID.
    // Per WebAuthn spec, the RP ID must be a registrable domain suffix of or equal to the origin's effective domain.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (step 7)
    // @see https://html.spec.whatwg.org/multipage/browsers.html#is-a-registrable-domain-suffix-of-or-is-equal-to

    // hostname is without port, host is with port
    const originHostname = new URL(meta.origin).hostname;
    const rpId = publicKeyCredentialCreationOptions.rp.id;

    assertSchema(
      originHostname,
      z.string().refine(
        (val) => {
          // Exact match (e.g., origin "example.com" and RP ID "example.com")
          if (val === rpId) return true;

          // Subdomain (e.g., origin "login.example.com" and RP ID "example.com")
          // Must end with a dot + rpId to prevent false positives such as "myexample.com" vs "example.com"
          if (val.endsWith(`.${rpId}`) && val.length > rpId.length + 1) {
            return true;
          }

          return false;
        },
        {
          message: `Origin "${originHostname}" is not a valid subdomain of RP ID "${rpId}".`,
        },
      ),
    );

    assertSchema(
      context,
      z.object({
        apiKeyId: z.string().nullable(),
      }),
    );

    const userVerificationEnabled = meta.userVerificationEnabled ?? true;
    const userPresenceEnabled = meta.userPresenceEnabled ?? true;

    if (
      !userVerificationEnabled &&
      publicKeyCredentialCreationOptions.authenticatorSelection
        ?.userVerification === UserVerificationRequirement.REQUIRED
    ) {
      throw new UserVerificationNotAvailable();
    }

    if (
      publicKeyCredentialCreationOptions.excludeCredentials &&
      publicKeyCredentialCreationOptions.excludeCredentials.length > 0
    ) {
      const credentialIdsToCheck: string[] = [];

      for (const descriptor of publicKeyCredentialCreationOptions.excludeCredentials) {
        try {
          // We must convert the raw byte ID to the UUID string format used in the DB.
          // If the ID is not a valid UUID (e.g., created by a different authenticator),
          // it cannot exist in our database, so we safely ignore it.
          const uuid = UUIDMapper.bytesToUUID(descriptor.id);
          credentialIdsToCheck.push(uuid);
        } catch {
          // ID format mismatch (not a UUID) -> ignore.
        }
      }

      // Only proceed if we found valid UUIDs to check
      if (credentialIdsToCheck.length > 0) {
        // Check against the repository
        const exists =
          await this.webAuthnRepository.existsByRpIdAndCredentialIds({
            rpId,
            credentialIds: credentialIdsToCheck,
          });

        if (exists) {
          // Per WebAuthn spec, if a credential in the exclude list exists,
          // the authenticator should fail or silently refuse to create a new one.
          throw new CredentialExcluded();
        }
      }
    }

    switch (publicKeyCredentialCreationOptions.attestation) {
      case Attestation.ENTERPRISE:
      case Attestation.INDIRECT:
        throw new AttestationNotSupported({
          data: {
            attestation: publicKeyCredentialCreationOptions.attestation,
          },
        });
    }

    const pubKeyCredParams = this._findFirstSupportedPubKeyCredParamsOrThrow(
      publicKeyCredentialCreationOptions.pubKeyCredParams,
    );

    const webAuthnCredentialId = randomUUID();
    const rawCredentialID = UUIDMapper.UUIDtoBytes(webAuthnCredentialId);

    const webAuthnCredentialPublicKey = await this.keyProvider
      .generateKeyPair({
        webAuthnCredentialId,
        pubKeyCredParams,
      })
      .catch((error) => {
        throw new GenerateKeyPairFailed({
          cause: error,
        });
      });

    assertSchema(
      webAuthnCredentialPublicKey.webAuthnCredentialKeyMetaType,
      z.enum(WebAuthnCredentialKeyMetaType),
    );

    const webAuthnCredential = await match({
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
              rpId,
              userId: meta.userId,
              apiKeyId: context.apiKeyId,
            });

          return webAuthnCredentialWithKeyVaultMeta;
        },
      )
      .exhaustive();

    // Generate authenticator data for registration.
    // https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
    const authData = await this._createAuthenticatorData({
      /**
       * Should be only set if we are creating a new credential (registration).
       */
      credentialID: rawCredentialID,
      rpId,
      counter: webAuthnCredential.counter,
      COSEPublicKey: webAuthnCredential.COSEPublicKey,
      userVerification:
        publicKeyCredentialCreationOptions.authenticatorSelection
          ?.userVerification,

      userVerificationEnabled,
      userPresenceEnabled,
    });

    // NOTE: Per WebAuthn spec, clientDataJSON generation is the Client's (browser/extension) responsibility,
    // not the Authenticator's. The authenticator should only receive clientDataHash.
    // However, VirtualAuthenticator acts as an all-in-one backend simulating both client and authenticator logic,
    // making this architectural simplification acceptable. The returned PublicKeyCredential must contain clientDataJSON.
    // @see https://www.w3.org/TR/webauthn-3/#dom-authenticatorresponse-clientdatajson
    const clientData: CollectedClientData = {
      type: 'webauthn.create',
      challenge: Buffer.from(
        publicKeyCredentialCreationOptions.challenge,
      ).toString('base64url'),
      origin: meta.origin,
      crossOrigin: meta.crossOrigin ?? false,
    };

    const clientDataJSON = new Uint8Array(
      Buffer.from(JSON.stringify(clientData)),
    );

    // Determine attestation format and statement based on requested attestation.
    // https://www.w3.org/TR/webauthn-3/#sctn-attstn-fmt-ids
    let fmt: Fmt;
    // https://www.w3.org/TR/webauthn-3/#attestation-statement
    let attStmt: Map<string, Uint8Array | number>;

    switch (publicKeyCredentialCreationOptions.attestation) {
      case Attestation.NONE:
      case undefined:
        ({ fmt, attStmt } = this._handleAttestationNone());
        break;
      case Attestation.DIRECT:
        ({ fmt, attStmt } = await this._handleAttestationDirect({
          webAuthnCredential,
          data: {
            clientDataJSON,
            authData,
          },
        }));
        break;
    }

    // NOTE: Per CTAP2 spec, attestationObject must use canonical CBOR encoding.
    // Map keys MUST be sorted by length first, then lexicographically if equal length.
    // Ensure cbor2 library supports canonical mode or keys are pre-sorted correctly.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-generating-an-attestation-object
    const attestationObject = new Map<string, unknown>([
      ['fmt', fmt],
      ['attStmt', attStmt],
      ['authData', authData],
    ]);

    const attestationObjectCborEncoded = cbor.encode(attestationObject);

    return {
      id: Buffer.from(rawCredentialID).toString('base64url'),
      rawId: rawCredentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON: clientDataJSON,
        attestationObject: attestationObjectCborEncoded,
      },
      clientExtensionResults: {},
    };
  }

  /**
   * Gets an existing credential (authentication ceremony).
   * @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion
   */
  public async getCredential(
    opts: VirtualAuthenticatorGetCredentialArgs,
  ): Promise<PublicKeyCredential> {
    const { publicKeyCredentialRequestOptions, meta, context } = opts;

    assertSchema(
      publicKeyCredentialRequestOptions,
      PublicKeyCredentialRequestOptionsSchema,
    );

    assertSchema(
      meta,
      z.object({
        origin: OriginSchema,
        userId: z.string(),
      }),
    );

    // Validate that the origin is authorized to act on behalf of the RP ID.
    // Per WebAuthn spec, the RP ID must be a registrable domain suffix of or equal to the origin's effective domain.
    // @see https://www.w3.org/TR/webauthn-3/#sctn-getAssertion (step 6)
    // @see https://html.spec.whatwg.org/multipage/browsers.html#is-a-registrable-domain-suffix-of-or-is-equal-to

    // hostname is without port, host is with port
    const originHostname = new URL(meta.origin).hostname;

    if (publicKeyCredentialRequestOptions.rpId !== undefined) {
      assertSchema(
        originHostname,
        z.string().refine(
          (val) => {
            // Exact match (e.g., origin "example.com" and RP ID "example.com")
            if (val === publicKeyCredentialRequestOptions.rpId) return true;

            // Subdomain (e.g., origin "login.example.com" and RP ID "example.com")
            // Must end with a dot + rpId to prevent false positives such as "myexample.com" vs "example.com"
            if (
              val.endsWith(`.${publicKeyCredentialRequestOptions.rpId}`) &&
              val.length > publicKeyCredentialRequestOptions.rpId!.length + 1
            ) {
              return true;
            }

            return false;
          },
          {
            message: `Origin "${originHostname}" is not a valid subdomain of RP ID "${publicKeyCredentialRequestOptions.rpId}".`,
          },
        ),
      );
    }

    assertSchema(
      context,
      z.object({
        apiKeyId: z.string().nullable(),
      }),
    );

    const userVerificationEnabled = meta.userVerificationEnabled ?? true;
    const userPresenceEnabled = meta.userPresenceEnabled ?? true;

    if (
      !userVerificationEnabled &&
      publicKeyCredentialRequestOptions.userVerification ===
        UserVerificationRequirement.REQUIRED
    ) {
      throw new UserVerificationNotAvailable();
    }

    // example.com
    const rpId = publicKeyCredentialRequestOptions.rpId ?? originHostname;

    const webAuthnCredential =
      await this.webAuthnRepository.findFirstAndIncrementCounterAtomicallyOrThrow(
        {
          rpId,
          userId: meta.userId,
          apiKeyId: context.apiKeyId,
          allowCredentialIds:
            publicKeyCredentialRequestOptions.allowCredentials?.map(
              (allowCredential) => UUIDMapper.bytesToUUID(allowCredential.id),
            ),
        },
      );

    const credentialID = UUIDMapper.UUIDtoBytes(webAuthnCredential.id);

    // NOTE: Per WebAuthn spec, clientDataJSON generation is the Client's (browser/extension) responsibility,
    // not the Authenticator's. The authenticator should only receive clientDataHash.
    // However, VirtualAuthenticator acts as an all-in-one backend simulating both client and authenticator logic,
    // making this architectural simplification acceptable. The returned PublicKeyCredential must contain clientDataJSON.
    // @see https://www.w3.org/TR/webauthn-3/#dom-authenticatorresponse-clientdatajson
    const clientData: CollectedClientData = {
      type: 'webauthn.get',
      challenge: Buffer.from(
        publicKeyCredentialRequestOptions.challenge,
      ).toString('base64url'),
      origin: meta.origin,
      crossOrigin: meta.crossOrigin ?? false,
    };

    const clientDataJSON = new Uint8Array(
      Buffer.from(JSON.stringify(clientData)),
    );

    const authData = await this._createAuthenticatorData({
      /**
       * Should be only set if we are creating a new credential (registration).
       */
      credentialID: undefined,
      rpId,
      counter: webAuthnCredential.counter,
      COSEPublicKey: webAuthnCredential.COSEPublicKey,
      userVerification: publicKeyCredentialRequestOptions.userVerification,

      userVerificationEnabled,
      userPresenceEnabled,
    });

    const dataToSign = this._createDataToSign({
      clientDataJSON,
      authData,
    });

    const { signature } = await this.keyProvider
      .sign({
        data: dataToSign,
        webAuthnCredential,
      })
      .catch((error) => {
        throw new SignatureFailed({
          cause: error,
        });
      });

    const userHandleBytes = UUIDMapper.UUIDtoBytes(webAuthnCredential.userId);

    return {
      id: Buffer.from(credentialID).toString('base64url'),
      rawId: credentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON: clientDataJSON,
        authenticatorData: authData,
        signature: new Uint8Array(signature),
        userHandle: userHandleBytes,
      },
      clientExtensionResults: {},
    };
  }
}
