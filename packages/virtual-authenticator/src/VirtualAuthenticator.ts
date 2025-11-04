import {
  Attestation,
  AuthenticatorTransport,
  PublicKeyCredentialType,
  UserVerificationRequirement,
} from '@repo/enums';
import { CredentialNotFound } from '@repo/exception';
import { COSEKey } from '@repo/keys';
import {
  Prisma,
  type PrismaClient,
  type User,
  type WebAuthnCredential,
  type WebAuthnCredentialKeyVaultKeyMeta,
} from '@repo/prisma';
import type { CredentialSigner, MaybePromise } from '@repo/types';
import {
  bufferToUuid,
  bytesNotEmpty,
  hasMinBytes,
  uuidToBuffer,
} from '@repo/utils';
import { sha256 } from '@repo/utils';
import type {
  CollectedClientData,
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialRequestOptions,
  PublicKeyCredential,
} from '@repo/validation';
import * as cbor from 'cbor';
import {
  applyCascade,
  assert,
  hasMinLength,
  isArray,
  isEnum,
  isInstanceOf,
  isNumber,
  isObject,
  isOptional,
  isPartial,
  isString,
} from 'typanion';
import type { PickDeep } from 'type-fest';

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
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-attested-credential-data
   */
  private async _createAttestedCredentialData(opts: {
    credentialID: Buffer;
    COSEPublicKey: COSEKey;
  }): Promise<Buffer> {
    const { credentialID, COSEPublicKey } = opts;

    // Byte length L of Credential ID, 16-bit unsigned big-endian integer.
    // Length (in bytes): 2
    const credentialIdLength = Buffer.alloc(2);
    credentialIdLength.writeUInt16BE(opts.credentialID.length, 0);

    // The credential public key encoded in COSE_Key format, as defined in Section 7 of [RFC8152],
    // using the CTAP2 canonical CBOR encoding form.
    // The COSE_Key-encoded credential public key MUST contain the "alg" parameter
    // and MUST NOT contain any other OPTIONAL parameters.
    // The "alg" parameter MUST contain a COSEAlgorithm value.
    // The encoded credential public key MUST also contain any additional REQUIRED parameters
    // stipulated by the relevant key type specification, i.e., REQUIRED for the key type "kty"
    // and algorithm "alg" (see Section 8 of [RFC8152]).
    // Length (in bytes): {variable}
    const credentialPublicKeyBuffer = COSEPublicKey.toBuffer();

    // https://www.w3.org/TR/webauthn-2/#sctn-attested-credential-data
    // Attested credential data is a variable-length byte array added to the
    // authenticator data when generating an attestation object for a given credential.
    const attestedCredentialData = Buffer.concat([
      VirtualAuthenticator.AAGUID,
      credentialIdLength,
      credentialID,
      credentialPublicKeyBuffer,
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
    credentialID?: Buffer;
    COSEPublicKey: COSEKey;
  }): Promise<Buffer> {
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
    user: Pick<User, 'id'>;
  }) {
    const { publicKeyCredentialRequestOptions, user } = opts;

    assert(publicKeyCredentialRequestOptions.rpId, isString());
    assert(
      publicKeyCredentialRequestOptions.allowCredentials,
      isOptional(
        isArray(
          isPartial({
            id: isInstanceOf(Buffer),
          }),
        ),
      ),
    );

    const where: Prisma.WebAuthnCredentialWhereInput = {
      rpId: publicKeyCredentialRequestOptions.rpId,
      userId: user.id,
    };

    if (
      publicKeyCredentialRequestOptions.allowCredentials &&
      publicKeyCredentialRequestOptions.allowCredentials.length > 0
    ) {
      const allowedIDs = publicKeyCredentialRequestOptions.allowCredentials.map(
        (publicKeyCredentialDescriptor) =>
          bufferToUuid(publicKeyCredentialDescriptor.id),
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
    user: Pick<User, 'id'>;
  }): Promise<
    WebAuthnCredential & {
      webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMeta | null;
    }
  > {
    const { publicKeyCredentialRequestOptions, user } = opts;

    const where =
      VirtualAuthenticator.createFindFirstMatchingCredentialWhereInput({
        publicKeyCredentialRequestOptions,
        user,
      });

    try {
      const webAuthnCredential =
        await this._findFirstAndIncrementCounterAtomically(where);

      return webAuthnCredential;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new CredentialNotFound({
            publicKeyCredentialRequestOptions,
            userId: user.id,
          });
        }
      }

      throw error;
    }
  }

  /**
   *
   * @see https://www.w3.org/TR/webauthn-2/#sctn-attestation
   */
  public async createCredential(opts: {
    publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions;
    COSEPublicKey: COSEKey;
    meta: {
      webAuthnCredentialKeyVaultKeyMeta: Pick<
        WebAuthnCredentialKeyVaultKeyMeta,
        'id'
      >;
    };
  }): Promise<PublicKeyCredential> {
    const { publicKeyCredentialCreationOptions, COSEPublicKey, meta } = opts;

    assert(publicKeyCredentialCreationOptions.rp.id, isString());
    assert(
      publicKeyCredentialCreationOptions.attestation,
      isOptional(isEnum([Attestation.NONE])),
    );
    assert(
      publicKeyCredentialCreationOptions.challenge,
      applyCascade(isInstanceOf(Buffer), hasMinBytes(16)),
    );
    assert(publicKeyCredentialCreationOptions.user.id, isInstanceOf(Buffer));
    assert(
      publicKeyCredentialCreationOptions.user.id,
      applyCascade(isInstanceOf(Buffer), bytesNotEmpty()),
    );
    assert(
      publicKeyCredentialCreationOptions.pubKeyCredParams,
      applyCascade(
        isArray(
          isObject({
            type: isEnum(PublicKeyCredentialType),
            alg: isNumber(),
          }),
        ),
        hasMinLength(1),
      ),
    );

    const newCredential = await this.prisma.webAuthnCredential.create({
      data: {
        webAuthnCredentialKeyVaultKeyMetaId:
          meta.webAuthnCredentialKeyVaultKeyMeta.id,
        COSEPublicKey: COSEPublicKey.toBuffer(),
        counter: 0,
        rpId: publicKeyCredentialCreationOptions.rp.id,
        userId: bufferToUuid(publicKeyCredentialCreationOptions.user.id),
      },
    });

    const credentialID = uuidToBuffer(newCredential.id);

    //  If credentialCreationData.attestationConveyancePreferenceOption’s value is "none"
    //  1. Replace potentially uniquely identifying information with non-identifying versions of the same:
    //      If the AAGUID in the attested credential data is 16 zero bytes,
    //      credentialCreationData.attestationObjectResult.fmt is "packed",
    //      and "x5c" is absent from credentialCreationData.attestationObjectResult,
    //      then self attestation is being used and no further action is needed.
    //  2. Otherwise
    //      Replace the AAGUID in the attested credential data with 16 zero bytes.
    //      Set the value of credentialCreationData.attestationObjectResult.fmt to "none",
    //      and set the value of credentialCreationData.attestationObjectResult.attStmt
    //      to be an empty CBOR map.
    // https://www.w3.org/TR/webauthn-2/#sctn-attstn-fmt-ids
    const fmt = 'none';

    // https://www.w3.org/TR/webauthn-2/#attestation-statement
    const attStmt = new Map<string, never>([]);

    // https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
    const authData = await this._createAuthenticatorData({
      rpId: publicKeyCredentialCreationOptions.rp.id,
      credentialID,
      counter: 0,
      COSEPublicKey,
    });

    const attestationObject = new Map<string, unknown>([
      ['fmt', fmt],
      ['attStmt', attStmt],
      ['authData', authData],
    ]);

    const clientData: CollectedClientData = {
      type: 'webauthn.create',
      challenge:
        publicKeyCredentialCreationOptions.challenge.toString('base64url'),
      origin: publicKeyCredentialCreationOptions.rp.id,
      crossOrigin: false,
    };

    return {
      id: credentialID.toString('base64url'),
      rawId: credentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON: Buffer.from(JSON.stringify(clientData)),
        attestationObject: cbor.encode(attestationObject),
      },
      clientExtensionResults: {},
    };
  }

  /**
   * @see https://www.w3.org/TR/webauthn-2/#sctn-credential-assertion
   */
  public async getCredential(opts: {
    publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions;
    credentialSignerFactory: (
      webAuthnCredential: WebAuthnCredential & {
        webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMeta | null;
      },
    ) => MaybePromise<CredentialSigner>;
    meta: {
      user: Pick<User, 'id'>;
    };
  }): Promise<PublicKeyCredential> {
    const { publicKeyCredentialRequestOptions, credentialSignerFactory, meta } =
      opts;

    assert(publicKeyCredentialRequestOptions.rpId, isString());
    assert(
      publicKeyCredentialRequestOptions.allowCredentials,
      isOptional(
        isArray(
          isObject({
            id: isInstanceOf(Buffer),
            type: isEnum(PublicKeyCredentialType),
            transports: isOptional(isArray(isEnum(AuthenticatorTransport))),
          }),
        ),
      ),
    );
    assert(
      publicKeyCredentialRequestOptions.challenge,
      applyCascade(isInstanceOf(Buffer), hasMinBytes(16)),
    );
    assert(
      publicKeyCredentialRequestOptions.userVerification,
      isOptional(isEnum(Object.values(UserVerificationRequirement))),
    );

    const webAuthnCredential =
      await this._findFirstMatchingCredentialAndIncrementCounterAtomically({
        publicKeyCredentialRequestOptions,
        user: meta.user,
      });

    const credentialID = uuidToBuffer(webAuthnCredential.id);
    const COSEPublicKey = COSEKey.fromBuffer(webAuthnCredential.COSEPublicKey);

    const clientData: CollectedClientData = {
      type: 'webauthn.get',
      challenge:
        publicKeyCredentialRequestOptions.challenge.toString('base64url'),
      origin: publicKeyCredentialRequestOptions.rpId,
      crossOrigin: false,
    };

    const clientDataJSON = Buffer.from(JSON.stringify(clientData));
    const clientDataHash = sha256(clientDataJSON);

    const authData = await this._createAuthenticatorData({
      rpId: publicKeyCredentialRequestOptions.rpId,
      counter: webAuthnCredential.counter,
      COSEPublicKey,
    });

    const dataToSign = Buffer.concat([authData, clientDataHash]);

    const credentialSigner = await credentialSignerFactory(webAuthnCredential);
    const signature = await credentialSigner.sign(dataToSign);

    return {
      id: credentialID.toString('base64url'),
      rawId: credentialID,
      type: PublicKeyCredentialType.PUBLIC_KEY,
      response: {
        clientDataJSON,
        authenticatorData: authData,
        signature: Buffer.from(signature),
        userHandle: null,
      },
      clientExtensionResults: {},
    };
  }
}
