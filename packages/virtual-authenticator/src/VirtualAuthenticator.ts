import { UUIDMapper } from '@repo/core/mappers';
import { Hash } from '@repo/crypto';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import { bytesNotEmpty, hasMinBytes } from '@repo/utils';
import * as cbor from 'cbor2';
import { randomUUID } from 'node:crypto';
import { match } from 'ts-pattern';
import {
  applyCascade,
  assert,
  hasMinLength,
  isArray,
  isBoolean,
  isEnum,
  isInstanceOf,
  isLiteral,
  isNumber,
  isObject,
  isOptional,
  isString,
} from 'typanion';

import { Attestation } from './enums/Attestation';
import { AuthenticatorAttachment } from './enums/AuthenticatorAttachment';
import { AuthenticatorTransport } from './enums/AuthenticatorTransport';
import { Fmt } from './enums/Fmt';
import { PublicKeyCredentialType } from './enums/PublicKeyCredentialType';
import { ResidentKeyRequirement } from './enums/ResidentKeyRequirement';
import { UserVerificationRequirement } from './enums/UserVerificationRequirement';
import { WebAuthnCredentialKeyMetaType } from './enums/WebAuthnCredentialKeyMetaType';
import { AttestationNotSupported } from './exceptions/AttestationNotSupported';
import { CredentialExcluded } from './exceptions/CredentialExcluded';
import { GenerateKeyPairFailed } from './exceptions/GenerateKeyPairFailed';
import { NoSupportedPubKeyCredParamFound } from './exceptions/NoSupportedPubKeyCredParamWasFound';
import { SignatureFailed } from './exceptions/SignatureFailed';
import type { IWebAuthnRepository } from './repositories/IWebAuthnRepository';
import type { IKeyProvider } from './types/IKeyProvider';
import type { WebAuthnCredentialWithMeta } from './types/WebAuthnCredentialWithMeta';
import type { CollectedClientData } from './zod-validation/CollectedClientDataSchema';
import type {
  PubKeyCredParamLoose,
  PubKeyCredParamStrict,
} from './zod-validation/PubKeyCredParamSchema';
import type { PublicKeyCredentialCreationOptions } from './zod-validation/PublicKeyCredentialCreationOptionsSchema';
import type { PublicKeyCredentialRequestOptions } from './zod-validation/PublicKeyCredentialRequestOptionsSchema';
import type { PublicKeyCredential } from './zod-validation/PublicKeyCredentialSchema';

export type VirtualAuthenticatorCredentialMetaArgs = {
  origin: string;
  userId: string;
};

export type VirtualAuthenticatorCreateCredentialArgs = {
  publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions;
  meta: VirtualAuthenticatorCredentialMetaArgs;
  context: {
    apiKeyId: string | null;
  };
};

export type VirtualAuthenticatorGetCredentialArgs = {
  publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions;
  meta: VirtualAuthenticatorCredentialMetaArgs;
  context: {
    apiKeyId: string | null | undefined;
  };
};

export type VirtualAuthenticatorOptions = {
  webAuthnRepository: IWebAuthnRepository;
  keyProvider: IKeyProvider;
};

export class VirtualAuthenticator {
  private readonly webAuthnRepository: IWebAuthnRepository;
  private readonly keyProvider: IKeyProvider;

  constructor(opts: VirtualAuthenticatorOptions) {
    this.webAuthnRepository = opts.webAuthnRepository;
    this.keyProvider = opts.keyProvider;
  }

  // The AAGUID of the authenticator.
  // Length (in bytes): 16
  // Zeroed-out AAGUID
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
    assert(
      pubKeyCredParams,
      applyCascade(
        isArray(
          isObject({
            type: isString(),
            alg: isNumber(),
          }),
        ),
        hasMinLength(1),
      ),
    );

    for (const pubKeyCredParam of pubKeyCredParams) {
      if (
        isEnum(PublicKeyCredentialType)(pubKeyCredParam.type) &&
        isEnum(COSEKeyAlgorithm)(pubKeyCredParam.alg)
      ) {
        return {
          type: pubKeyCredParam.type,
          alg: pubKeyCredParam.alg,
        };
      }
    }

    throw new NoSupportedPubKeyCredParamFound();
  }

  /**
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-attested-credential-data
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

    // https://www.w3.org/TR/webauthn-2/#sctn-attested-credential-data
    // Attested credential data is a variable-length byte array added to the
    // authenticator data when generating an attestation object for a given credential.
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
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
   */
  private async _createAuthenticatorData(opts: {
    rpId: string;
    counter: number;
    credentialID?: Uint8Array;
    COSEPublicKey: Uint8Array;
  }): Promise<Uint8Array> {
    const { rpId, counter, credentialID, COSEPublicKey } = opts;

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
    const flags = Buffer.from([(credentialID ? 0b01000000 : 0) | 0b00000101]);

    // Signature counter, 32-bit unsigned big-endian integer.
    // Length (in bytes): 4
    const signCountBuffer = Buffer.alloc(4);
    signCountBuffer.writeUInt32BE(counter, 0);

    // https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
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

  private _createDataToSign(opts: {
    clientDataJSON: Uint8Array;
    authData: Uint8Array;
  }): Uint8Array {
    const { clientDataJSON, authData } = opts;
    const clientDataHash = Hash.sha256(clientDataJSON);

    const dataToSign = Buffer.concat([authData, clientDataHash]);

    return new Uint8Array(dataToSign);
  }

  private _handleAttestationNone(): {
    fmt: Fmt;
    attStmt: Map<string, Uint8Array | number>;
  } {
    // https://www.w3.org/TR/webauthn-2/#sctn-attstn-fmt-ids
    const fmt = Fmt.NONE;

    // https://www.w3.org/TR/webauthn-2/#attestation-statement
    const attStmt = new Map<string, Uint8Array | number>([]);

    return {
      fmt,
      attStmt,
    };
  }

  private async _handleAttestationDirect(opts: {
    webAuthnCredential: WebAuthnCredentialWithMeta;
    data: {
      clientDataJSON: Uint8Array;
      authData: Uint8Array;
    };
  }): Promise<{ fmt: Fmt; attStmt: Map<string, Uint8Array | number> }> {
    const { webAuthnCredential, data } = opts;

    // https://www.w3.org/TR/webauthn-2/#sctn-attstn-fmt-ids
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

    // https://www.w3.org/TR/webauthn-2/#attestation-statement
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
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-attestation
   */
  public async createCredential(
    opts: VirtualAuthenticatorCreateCredentialArgs,
  ): Promise<PublicKeyCredential> {
    const { publicKeyCredentialCreationOptions, meta, context } = opts;

    assert(publicKeyCredentialCreationOptions.rp.id, isString());
    assert(publicKeyCredentialCreationOptions.rp.name, isString());
    assert(
      publicKeyCredentialCreationOptions.attestation,
      isOptional(isEnum(Attestation)),
    );
    assert(
      publicKeyCredentialCreationOptions.challenge,
      applyCascade(isInstanceOf(Uint8Array), hasMinBytes(16)),
    );
    assert(
      publicKeyCredentialCreationOptions.user.id,
      isInstanceOf(Uint8Array),
    );
    assert(
      publicKeyCredentialCreationOptions.user.id,
      applyCascade(isInstanceOf(Uint8Array), bytesNotEmpty()),
    );
    assert(
      UUIDMapper.bytesToUUID(publicKeyCredentialCreationOptions.user.id),
      isLiteral(meta.userId),
    );
    assert(publicKeyCredentialCreationOptions.user.name, isString());
    assert(publicKeyCredentialCreationOptions.user.displayName, isString());
    assert(
      publicKeyCredentialCreationOptions.pubKeyCredParams,
      applyCascade(
        isArray(
          isObject({
            type: isString(),
            alg: isNumber(),
          }),
        ),
        hasMinLength(1),
      ),
    );
    assert(
      publicKeyCredentialCreationOptions.excludeCredentials,
      isOptional(
        isArray(
          isObject({
            type: isEnum(PublicKeyCredentialType),
            id: isInstanceOf(Uint8Array),
            transports: isOptional(isArray(isEnum(AuthenticatorTransport))),
          }),
        ),
      ),
    );
    assert(publicKeyCredentialCreationOptions.timeout, isOptional(isNumber()));
    assert(
      publicKeyCredentialCreationOptions.authenticatorSelection
        ?.authenticatorAttachment,
      isOptional(isEnum(AuthenticatorAttachment)),
    );
    assert(
      publicKeyCredentialCreationOptions.authenticatorSelection
        ?.userVerification,
      isOptional(isEnum(UserVerificationRequirement)),
    );
    assert(
      publicKeyCredentialCreationOptions.authenticatorSelection
        ?.requireResidentKey,
      isOptional(isBoolean()),
    );
    assert(
      publicKeyCredentialCreationOptions.authenticatorSelection?.residentKey,
      isOptional(isEnum(ResidentKeyRequirement)),
    );
    assert(meta.userId, isString());
    assert(meta.origin, isString());

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
            rpId: publicKeyCredentialCreationOptions.rp.id,
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

    assert(
      webAuthnCredentialPublicKey.webAuthnCredentialKeyMetaType,
      isEnum(WebAuthnCredentialKeyMetaType),
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
              rpId: publicKeyCredentialCreationOptions.rp.id,
              userId: meta.userId,
              apiKeyId: context.apiKeyId,
            });

          return webAuthnCredentialWithKeyVaultMeta;
        },
      )
      .exhaustive();

    // https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
    const authData = await this._createAuthenticatorData({
      rpId: publicKeyCredentialCreationOptions.rp.id,
      credentialID: rawCredentialID,
      counter: webAuthnCredential.counter,
      COSEPublicKey: webAuthnCredential.COSEPublicKey,
    });

    const clientData: CollectedClientData = {
      type: 'webauthn.create',
      challenge: Buffer.from(
        publicKeyCredentialCreationOptions.challenge,
      ).toString('base64url'),
      origin: meta.origin,
      crossOrigin: false,
    };

    const clientDataJSON = new Uint8Array(
      Buffer.from(JSON.stringify(clientData)),
    );

    // https://www.w3.org/TR/webauthn-2/#sctn-attstn-fmt-ids
    let fmt: Fmt;
    // https://www.w3.org/TR/webauthn-2/#attestation-statement
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
   * @see https://www.w3.org/TR/webauthn-2/#sctn-credential-assertion
   */
  public async getCredential(
    opts: VirtualAuthenticatorGetCredentialArgs,
  ): Promise<PublicKeyCredential> {
    const { publicKeyCredentialRequestOptions, meta, context } = opts;

    assert(publicKeyCredentialRequestOptions.rpId, isString());
    assert(
      publicKeyCredentialRequestOptions.allowCredentials,
      isOptional(
        isArray(
          isObject({
            id: isInstanceOf(Uint8Array),
            type: isEnum(PublicKeyCredentialType),
            transports: isOptional(isArray(isEnum(AuthenticatorTransport))),
          }),
        ),
      ),
    );
    assert(
      publicKeyCredentialRequestOptions.challenge,
      applyCascade(isInstanceOf(Uint8Array), hasMinBytes(16)),
    );
    assert(
      publicKeyCredentialRequestOptions.userVerification,
      isOptional(isEnum(UserVerificationRequirement)),
    );

    const webAuthnCredential =
      await this.webAuthnRepository.findFirstAndIncrementCounterAtomicallyOrThrow(
        {
          rpId: publicKeyCredentialRequestOptions.rpId,
          userId: meta.userId,
          apiKeyId: context.apiKeyId,
          allowCredentialIds:
            publicKeyCredentialRequestOptions.allowCredentials?.map(
              (allowCredential) => UUIDMapper.bytesToUUID(allowCredential.id),
            ),
        },
      );

    console.log({ webAuthnCredential });

    const credentialID = UUIDMapper.UUIDtoBytes(webAuthnCredential.id);

    const clientData: CollectedClientData = {
      type: 'webauthn.get',
      challenge: Buffer.from(
        publicKeyCredentialRequestOptions.challenge,
      ).toString('base64url'),
      origin: meta.origin,
      crossOrigin: false,
    };

    const clientDataJSON = new Uint8Array(
      Buffer.from(JSON.stringify(clientData)),
    );

    const authData = await this._createAuthenticatorData({
      rpId: publicKeyCredentialRequestOptions.rpId,
      counter: webAuthnCredential.counter,
      COSEPublicKey: webAuthnCredential.COSEPublicKey,
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

    return {
      id: Buffer.from(credentialID).toString('base64url'),
      rawId: credentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON: clientDataJSON,
        authenticatorData: authData,
        signature: new Uint8Array(signature),
        userHandle: null,
      },
      clientExtensionResults: {},
    };
  }
}
