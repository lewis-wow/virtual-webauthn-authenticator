import {
  createHash,
  createPrivateKey,
  createPublicKey,
  createSign,
  KeyObject,
  randomBytes,
} from 'crypto';
import cbor from 'cbor';
import { MissingRelayingPartyEntityId } from './known_exceptions/MissingRelayingPartyEntityId.js';
import { toBuffer } from '@repo/utils/toBuffer';

export interface IKeyPairGenerator {
  generateKeyPair(): { privateKey: Buffer; publicKey: Buffer };
}

export type AuthenticatorOptions = {
  keyPairGenerator: IKeyPairGenerator;
};

export class Authenticator {
  private signCount: number = 0;
  private readonly keyPairGenerator: IKeyPairGenerator;

  constructor(opts: AuthenticatorOptions) {
    this.keyPairGenerator = opts.keyPairGenerator;
  }

  public createCredential(
    options: PublicKeyCredentialCreationOptions,
  ): PublicKeyCredential {
    if (!options.rp.id) {
      throw new MissingRelayingPartyEntityId();
    }

    const { privateKey, publicKey } = this.keyPairGenerator.generateKeyPair();

    const credentialID = this._generateCredentialId();

    // 3. Construct the Authenticator Data (authData)
    const rpIdHash = createHash('sha256').update(options.rp.id).digest();

    // --- FLAGS ---
    // Bit 0 (UP - User Present): 0 - As requested, we are NOT proving user presence.
    // Bit 2 (UV - User Verified): 0 - We are not proving user verification.
    // Bit 6 (AT - Attested Credential Data Included): 1 - We are including attested data.
    const flags = Buffer.from([0b01000000]);

    const signCountBuffer = Buffer.alloc(4);
    signCountBuffer.writeUInt32BE(this.signCount, 0);

    const aaguid = Buffer.alloc(16); // Zeroed-out AAGUID

    const credentialIdLength = Buffer.alloc(2);
    credentialIdLength.writeUInt16BE(credentialID.length, 0);

    const cosePublicKey = this._publicKeyToCOSE(
      this._publicKeyToKeyObject(publicKey),
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
      challenge: toBuffer(options.challenge).toString('base64url'),
      origin: options.rp.id,
      crossOrigin: false,
    };
    const clientDataJSON = JSON.stringify(clientData);

    // 5. Create the Attestation Object based on the requested attestation type
    const attestationType = options.attestation || 'none';
    let attestationObject: Map<string, any>;

    switch (attestationType) {
      case 'direct':
      case 'indirect': {
        // For this simulation, we'll treat 'direct' and 'indirect' as a 'packed' self-attestation.
        const clientDataHash = createHash('sha256')
          .update(clientDataJSON)
          .digest();
        const dataToSign = Buffer.concat([authData, clientDataHash]);

        const signer = createSign('sha256');
        signer.update(dataToSign);
        const signature = signer.sign(this._privateKeyToKeyObject(privateKey));

        const attestationStatement = new Map<string, any>([
          ['alg', -7], // ES256, matches our key generation
          ['sig', signature],
        ]);

        attestationObject = new Map<string, any>([
          ['fmt', 'packed'],
          ['attStmt', attestationStatement],
          ['authData', authData],
        ]);
        break;
      }
      case 'none':
      default: {
        // For 'none' attestation format, the attestation statement MUST be an empty map.
        const emptyAttestationStatement = new Map();

        attestationObject = new Map<string, any>([
          ['fmt', 'none'],
          ['attStmt', emptyAttestationStatement],
          ['authData', authData],
        ]);
        break;
      }
    }

    // 6. Assemble the final PublicKeyCredential object
    const attestationObjectCbor = cbor.encode(attestationObject);

    return {
      id: credentialID.toString('base64url'),
      rawId: credentialID.buffer,
      type: 'public-key',
      response: {
        clientDataJSON: toBuffer(clientDataJSON).buffer,
        attestationObject: attestationObjectCbor,
      },
    };
  }

  private _publicKeyToKeyObject(publicKey: Buffer) {
    return createPublicKey({
      key: publicKey,
      format: 'der',
      type: 'spki',
    });
  }

  private _privateKeyToKeyObject(privatekay: Buffer) {
    return createPrivateKey({
      key: privatekay,
      format: 'der',
      type: 'pkcs8',
    });
  }

  /**
   * Converts a Node.js crypto public key to COSE format for WebAuthn.
   * @param {crypto.KeyObject} publicKey - The public key to convert.
   * @returns {Buffer} The public key encoded in COSE format.
   */
  private _publicKeyToCOSE(publicKey: KeyObject): Buffer {
    const jwk = publicKey.export({ format: 'jwk' });

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
}
