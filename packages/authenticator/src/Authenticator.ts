import { createHash, randomBytes } from 'crypto';
import cbor from 'cbor';
import { toBuffer } from '@repo/utils/toBuffer';
import { toBase64Url } from '@repo/utils/toBase64Url';
import { match } from 'ts-pattern';
import { PublicKeyCredentialDto } from './dto/PublicKeyCredentialDto.js';
import type {
  IPublicKeyCredential,
  ISigner,
  IPublicJsonWebKeyFactory,
} from './types.js';
import { assert, isString } from 'typanion';

export type AuthenticatorOptions = {
  signer: ISigner;
  publicJsonWebKeyFactory: IPublicJsonWebKeyFactory;
};

export class Authenticator {
  private readonly signer: ISigner;
  private readonly publicJsonWebKeyFactory: IPublicJsonWebKeyFactory;

  constructor(opts: AuthenticatorOptions) {
    this.signer = opts.signer;
    this.publicJsonWebKeyFactory = opts.publicJsonWebKeyFactory;
  }

  public async createCredential(
    options: PublicKeyCredentialCreationOptions,
  ): Promise<IPublicKeyCredential> {
    assert(options.rp.id, isString());

    const credentialID = this._generateCredentialId();
    const rpIdHash = this._sha256(toBuffer(options.rp.id));

    // --- FLAGS ---
    // Bit 0 (UP - User Present): 0 - As requested, we are NOT proving user presence.
    // Bit 2 (UV - User Verified): 0 - We are not proving user verification.
    // Bit 6 (AT - Attested Credential Data Included): 1 - We are including attested data.
    const flags = Buffer.from([0b01000000]);

    const signCountBuffer = Buffer.alloc(4);
    signCountBuffer.writeUInt32BE(0, 0);

    const aaguid = Buffer.alloc(16); // Zeroed-out AAGUID

    const credentialIdLength = Buffer.alloc(2);
    credentialIdLength.writeUInt16BE(credentialID.length, 0);

    const cosePublicKey = this._publicJsonWebKeyToCOSE(
      await this.publicJsonWebKeyFactory.getPublicJsonWebKey(),
    );

    const attestedCredentialData = Buffer.concat([
      aaguid,
      credentialIdLength,
      credentialID,
      cosePublicKey,
    ]);

    const authData = Buffer.concat([
      rpIdHash,
      flags,
      signCountBuffer,
      attestedCredentialData,
    ]);

    const clientData = {
      type: 'webauthn.create',
      challenge: toBase64Url(options.challenge),
      origin: options.rp.id,
      crossOrigin: false,
    };

    const clientDataJSON = JSON.stringify(clientData);

    // 5. Create the Attestation Object based on the requested attestation type
    const attestationType = options.attestation || 'none';

    const attestationStatement = await match({ attestationType })
      .returnType<Promise<Map<string, unknown>>>()
      .with(
        { attestationType: 'direct' },
        { attestationType: 'indirect' },
        async () => {
          const clientDataHash = this._sha256(toBuffer(clientDataJSON));
          const dataToSign = Buffer.concat([authData, clientDataHash]);

          const signature = await this.signer.sign(dataToSign);

          return new Map<string, unknown>([
            ['alg', -7], // ES256, matches our key generation
            ['sig', signature],
          ]);
        },
      )
      .with({ attestationType: 'none' }, async () => {
        return new Map<string, unknown>([]);
      })
      .otherwise(() => {
        throw new Error();
      });

    const attestationObject = new Map<string, unknown>([
      ['fmt', attestationType],
      ['attStmt', attestationStatement],
      ['authData', authData],
    ]);

    const attestationObjectCbor = cbor.encode(attestationObject);

    return new PublicKeyCredentialDto({
      id: credentialID.toString('base64url'),
      rawId: credentialID,
      type: 'public-key',
      response: {
        clientDataJSON: Buffer.from(clientDataJSON),
        attestationObject: attestationObjectCbor,
      },
      authenticatorAttachment: null,
      clientExtensionResults: {},
    });
  }

  private _publicJsonWebKeyToCOSE(jwk: JsonWebKey): Buffer {
    if (!jwk.x || !jwk.y) {
      throw new Error('JWK is missing x or y coordinates.');
    }

    const coseKey = new Map<number, number | Buffer>([
      [1, 2], // kty: EC2
      [3, -7], // alg: ES256
      [-1, 1], // crv: P-256
      [-2, Buffer.from(jwk.x, 'base64')], // x-coordinate
      [-3, Buffer.from(jwk.y, 'base64')], // y-coordinate
    ]);

    return cbor.encode(coseKey);
  }

  private _generateCredentialId(): Buffer<ArrayBuffer> {
    return randomBytes(32) as Buffer<ArrayBuffer>;
  }

  private _sha256(data: Buffer): Buffer {
    return createHash('sha256').update(data).digest();
  }
}
