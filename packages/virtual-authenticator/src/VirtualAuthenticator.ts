import {
  Attestation,
  AuthenticatorTransport,
  COSEKeyAlgorithm,
  Fmt,
  PublicKeyCredentialType,
  UserVerificationRequirement,
  WebAuthnCredentialKeyMetaType,
} from '@repo/enums';
import {
  Prisma,
  type PrismaClient,
  type WebAuthnCredential,
  type WebAuthnCredentialKeyVaultKeyMeta,
} from '@repo/prisma';
import type { MaybePromise } from '@repo/types';
import {
  bytesToUuid,
  uuidToBytes,
  bytesNotEmpty,
  hasMinBytes,
} from '@repo/utils';
import { sha256 } from '@repo/utils';
import {
  type CollectedClientData,
  type PublicKeyCredentialCreationOptions,
  type PublicKeyCredentialRequestOptions,
  type PublicKeyCredential,
  type PubKeyCredParamLoose,
  type PubKeyCredParamStrict,
} from '@repo/validation';
import * as cbor from 'cbor';
import { randomUUID } from 'node:crypto';
import {
  applyCascade,
  assert,
  hasMinLength,
  isArray,
  isEnum,
  isInstanceOf,
  isLiteral,
  isNumber,
  isObject,
  isOptional,
  isPartial,
  isString,
} from 'typanion';
import type { PickDeep } from 'type-fest';

import { SupportedCOSEKeyAlgorithm } from './enums/SupportedCOSEKeyAlgorithm';
import { SupportedPublicKeyCredentialType } from './enums/SupportedPublicKeyCredentialType';
import { AttestationNotSupported } from './exceptions/AttestationNotSupported';
import { CredentialNotFound } from './exceptions/CredentialNotFound';
import { NoSupportedPubKeyCredParamFound } from './exceptions/NoSupportedPubKeyCredParamWasFound';

export type WebAuthnCredentialWithMeta = WebAuthnCredential & {
  webAuthnCredentialKeyMetaType: typeof WebAuthnCredentialKeyMetaType.KEY_VAULT;
  webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMeta;
};

export type GenerateKeyPair = (args: {
  webAuthnCredentialId: string;
  pubKeyCredParams: PubKeyCredParamStrict;
}) => MaybePromise<
  {
    COSEPublicKey: Uint8Array;
  } & {
    webAuthnCredentialKeyMetaType: typeof WebAuthnCredentialKeyMetaType.KEY_VAULT;
    webAuthnCredentialKeyVaultKeyMeta: {
      keyVaultKeyId: string | null | undefined;
      keyVaultKeyName: string;
      hsm: boolean | undefined;
    };
  }
>;

export type SignatureFactory = (args: {
  data: Uint8Array;
  webAuthnCredential: WebAuthnCredentialWithMeta;
}) => MaybePromise<{ signature: Uint8Array; alg: COSEKeyAlgorithm }>;

export type VirtualAuthenticatorOptions = {
  prisma: PrismaClient;
};

export class VirtualAuthenticator {
  private readonly prisma: PrismaClient;

  constructor(opts: VirtualAuthenticatorOptions) {
    this.prisma = opts.prisma;
  }

  // The AAGUID of the authenticator.
  // Length (in bytes): 16
  // Zeroed-out AAGUID
  static readonly AAGUID = Buffer.alloc(16);

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
        isEnum(SupportedPublicKeyCredentialType)(pubKeyCredParam.type) &&
        isEnum(SupportedCOSEKeyAlgorithm)(pubKeyCredParam.alg)
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

    return attestedCredentialData;
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
    const rpIdHash = sha256(Buffer.from(rpId));

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

    return authenticatorData;
  }

  private async _findFirstAndIncrementCounterAtomically(
    where: Prisma.WebAuthnCredentialWhereInput,
  ): Promise<
    WebAuthnCredential & {
      webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMeta | null;
    }
  > {
    const updatedWebAuthnCredential = await this.prisma.$transaction(
      async (tx) => {
        const webAuthnCredential = await tx.webAuthnCredential.findFirstOrThrow(
          {
            where,
          },
        );

        return await tx.webAuthnCredential.update({
          where: {
            id: webAuthnCredential.id,
          },
          data: {
            counter: {
              increment: 1,
            },
          },
          include: {
            webAuthnCredentialKeyVaultKeyMeta: true,
          },
        });
      },
    );

    return updatedWebAuthnCredential;
  }

  public static createFindFirstMatchingCredentialWhereInput(opts: {
    publicKeyCredentialRequestOptions: PickDeep<
      PublicKeyCredentialRequestOptions,
      `allowCredentials.${number}.id` | 'rpId'
    >;
    userId: string;
  }) {
    const { publicKeyCredentialRequestOptions, userId } = opts;

    assert(publicKeyCredentialRequestOptions.rpId, isString());
    assert(
      publicKeyCredentialRequestOptions.allowCredentials,
      isOptional(
        isArray(
          isPartial({
            id: isInstanceOf(Uint8Array),
          }),
        ),
      ),
    );

    const where: Prisma.WebAuthnCredentialWhereInput = {
      rpId: publicKeyCredentialRequestOptions.rpId,
      userId,
    };

    if (
      publicKeyCredentialRequestOptions.allowCredentials &&
      publicKeyCredentialRequestOptions.allowCredentials.length > 0
    ) {
      const allowedIDs = publicKeyCredentialRequestOptions.allowCredentials.map(
        (publicKeyCredentialDescriptor) =>
          bytesToUuid(publicKeyCredentialDescriptor.id),
      );

      where.id = {
        in: allowedIDs,
      };
    }

    return where;
  }

  private async _findFirstMatchingCredentialAndIncrementCounterAtomically(opts: {
    publicKeyCredentialRequestOptions: PickDeep<
      PublicKeyCredentialRequestOptions,
      `allowCredentials.${number}.id` | 'rpId'
    >;
    userId: string;
  }): Promise<WebAuthnCredentialWithMeta> {
    const { publicKeyCredentialRequestOptions, userId } = opts;

    const where =
      VirtualAuthenticator.createFindFirstMatchingCredentialWhereInput({
        publicKeyCredentialRequestOptions,
        userId,
      });

    try {
      const webAuthnCredential =
        await this._findFirstAndIncrementCounterAtomically(where);

      return webAuthnCredential as WebAuthnCredentialWithMeta;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new CredentialNotFound({
            publicKeyCredentialRequestOptions,
            userId,
          });
        }
      }

      throw error;
    }
  }

  private async _createWebauthnCredentialDatabaseRecord(
    data: {
      id: string;
      COSEPublicKey: Uint8Array;
      rpId: string;
      userId: string;
    } & {
      webAuthnCredentialKeyMetaType: typeof WebAuthnCredentialKeyMetaType.KEY_VAULT;
      webAuthnCredentialKeyVaultKeyMeta: {
        keyVaultKeyId?: string | null | undefined;
        keyVaultKeyName: string;
        hsm?: boolean | undefined;
      };
    },
  ): Promise<WebAuthnCredentialWithMeta> {
    const webAuthnCredential = await this.prisma.webAuthnCredential.create({
      data: {
        ...data,
        webAuthnCredentialKeyVaultKeyMeta: {
          create: {
            ...data.webAuthnCredentialKeyVaultKeyMeta,
          },
        },
        counter: 0,
      },
      include: {
        webAuthnCredentialKeyVaultKeyMeta: true,
      },
    });

    return webAuthnCredential as WebAuthnCredentialWithMeta;
  }

  private _createDataToSign(opts: {
    clientDataJSON: Uint8Array;
    authData: Uint8Array;
  }): Uint8Array {
    const { clientDataJSON, authData } = opts;
    const clientDataHash = sha256(clientDataJSON);

    const dataToSign = Buffer.concat([authData, clientDataHash]);

    return dataToSign;
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
    signatureFactory: SignatureFactory;
    webAuthnCredential: WebAuthnCredentialWithMeta;
    data: {
      clientDataJSON: Uint8Array;
      authData: Uint8Array;
    };
  }): Promise<{ fmt: Fmt; attStmt: Map<string, Uint8Array | number> }> {
    const { signatureFactory, webAuthnCredential, data } = opts;

    // https://www.w3.org/TR/webauthn-2/#sctn-attstn-fmt-ids
    const fmt = Fmt.PACKED;

    const dataToSign = this._createDataToSign(data);

    const { signature, alg } = await signatureFactory({
      data: dataToSign,
      webAuthnCredential,
    });

    // https://www.w3.org/TR/webauthn-2/#attestation-statement
    const attStmt = new Map<string, Uint8Array | number>([
      ['alg', alg],
      ['sig', signature],
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
  public async createCredential(opts: {
    publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions;
    generateKeyPair: GenerateKeyPair;
    signatureFactory: SignatureFactory;
    meta: {
      userId: string;
      origin: string;
    };
  }): Promise<PublicKeyCredential> {
    const {
      publicKeyCredentialCreationOptions,
      generateKeyPair,
      signatureFactory,
      meta,
    } = opts;

    assert(publicKeyCredentialCreationOptions.rp.id, isString());
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
      bytesToUuid(publicKeyCredentialCreationOptions.user.id),
      isLiteral(meta.userId),
    );
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

    switch (publicKeyCredentialCreationOptions.attestation) {
      case Attestation.ENTERPRISE:
      case Attestation.INDIRECT:
        throw new AttestationNotSupported({
          attestation: publicKeyCredentialCreationOptions.attestation,
        });
    }

    const pubKeyCredParams = this._findFirstSupportedPubKeyCredParamsOrThrow(
      publicKeyCredentialCreationOptions.pubKeyCredParams,
    );

    const webAuthnCredentialId = randomUUID();
    const rawCredentialID = uuidToBytes(webAuthnCredentialId);

    const webAuthnCredentialPublicKey = await generateKeyPair({
      webAuthnCredentialId,
      pubKeyCredParams,
    });

    const webAuthnCredential =
      await this._createWebauthnCredentialDatabaseRecord({
        id: webAuthnCredentialId,
        webAuthnCredentialKeyMetaType:
          webAuthnCredentialPublicKey.webAuthnCredentialKeyMetaType,
        webAuthnCredentialKeyVaultKeyMeta:
          webAuthnCredentialPublicKey.webAuthnCredentialKeyVaultKeyMeta,
        COSEPublicKey: webAuthnCredentialPublicKey.COSEPublicKey,
        rpId: publicKeyCredentialCreationOptions.rp.id,
        userId: meta.userId,
      });

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

    console.log({ clientData: JSON.stringify(clientData) });

    const clientDataJSON = Buffer.from(JSON.stringify(clientData));

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
          signatureFactory,
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

    return {
      id: Buffer.from(rawCredentialID).toString('base64url'),
      rawId: rawCredentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON,
        attestationObject: Buffer.from(cbor.encode(attestationObject)),
      },
      clientExtensionResults: {},
    };
  }

  /**
   * @see https://www.w3.org/TR/webauthn-2/#sctn-credential-assertion
   */
  public async getCredential(opts: {
    publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions;
    signatureFactory: SignatureFactory;
    meta: {
      userId: string;
      origin: string;
    };
  }): Promise<PublicKeyCredential> {
    const { publicKeyCredentialRequestOptions, signatureFactory, meta } = opts;

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
      await this._findFirstMatchingCredentialAndIncrementCounterAtomically({
        publicKeyCredentialRequestOptions,
        userId: meta.userId,
      });

    const credentialID = uuidToBytes(webAuthnCredential.id);

    const clientData: CollectedClientData = {
      type: 'webauthn.get',
      challenge: Buffer.from(
        publicKeyCredentialRequestOptions.challenge,
      ).toString('base64url'),
      origin: meta.origin,
      crossOrigin: false,
    };

    const clientDataJSON = Buffer.from(JSON.stringify(clientData));

    const authData = await this._createAuthenticatorData({
      rpId: publicKeyCredentialRequestOptions.rpId,
      counter: webAuthnCredential.counter,
      COSEPublicKey: webAuthnCredential.COSEPublicKey,
    });

    const dataToSign = this._createDataToSign({
      clientDataJSON,
      authData,
    });

    const { signature } = await signatureFactory({
      data: dataToSign,
      webAuthnCredential,
    });

    return {
      id: Buffer.from(credentialID).toString('base64url'),
      rawId: credentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON,
        authenticatorData: authData,
        signature,
        userHandle: null,
      },
      clientExtensionResults: {},
    };
  }
}
