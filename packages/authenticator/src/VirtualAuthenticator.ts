import {
  createHash,
  createSign,
  generateKeyPairSync,
  KeyObject,
} from 'node:crypto';
import { encode } from 'cbor2';

export class VirtualAuthenticator {
  private privateKey: KeyObject | null = null;
  private credentialID: Buffer | null = null;
  private signCount: number = 0;

  /**
   * Simulates the navigator.credentials.create() call.
   * @param {PublicKeyCredentialCreationOptions} options - The standard options object.
   * @returns {PublicKeyCredential} A PublicKeyCredential object with a valid attestation response.
   */
  public createCredential(
    options: PublicKeyCredentialCreationOptions,
  ): PublicKeyCredential {
    // 1. Generate a new key pair for the credential.
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });
    this.privateKey = privateKey;

    // 2. Create the Credential ID
    this.credentialID = this._generateCredentialId();

    // 3. Construct the Authenticator Data (authData)
    const rpIdHash = createHash('sha256')
      .update(options.rp.id ?? '')
      .digest();

    // --- FLAGS ---
    // Bit 0 (UP - User Present): 0 - As requested, we are NOT proving user presence.
    // Bit 2 (UV - User Verified): 0 - We are not proving user verification.
    // Bit 6 (AT - Attested Credential Data Included): 1 - We are including attested data.
    const flags = Buffer.from([0b01000000]);

    const signCountBuffer = Buffer.alloc(4);
    signCountBuffer.writeUInt32BE(this.signCount, 0);

    const aaguid = Buffer.alloc(16); // Zeroed-out AAGUID

    const credentialIdLength = Buffer.alloc(2);
    credentialIdLength.writeUInt16BE(this.credentialID.length, 0);

    const cosePublicKey = this._publicKeyToCOSE(publicKey);

    const attestedCredentialData = Buffer.concat([
      aaguid,
      credentialIdLength,
      this.credentialID,
      cosePublicKey,
    ]);

    const authData = Buffer.concat([
      rpIdHash,
      flags,
      signCountBuffer,
      attestedCredentialData,
    ]);

    // 4. Construct clientDataJSON
    const clientData = {
      type: 'webauthn.create',
      challenge: options.challenge.toString(),
      origin: `https://${options.rp.id}`, // Simulating the origin
      crossOrigin: false,
    };
    const clientDataJSON = JSON.stringify(clientData);
    const clientDataHash = createHash('sha256').update(clientDataJSON).digest();

    // 5. Create the Attestation Statement
    const dataToSign = Buffer.concat([authData, clientDataHash]);

    if (!this.privateKey) {
      throw new Error('Private key was not generated.');
    }

    const signer = createSign('sha256');
    signer.update(dataToSign);
    const signature = signer.sign(this.privateKey);

    const attestationStatement = {
      sig: signature,
    };

    const attestationObject = {
      fmt: 'none', // 'none' is the simplest attestation format
      attStmt: attestationStatement,
      authData: authData,
    };

    // 6. Assemble the final PublicKeyCredential object
    const attestationObjectCbor = encode(attestationObject);

    return {
      id: this.credentialID.toString('base64url'),
      rawId: this.credentialID as unknown as ArrayBuffer,
      type: 'public-key',
      response: {
        clientDataJSON: Buffer.from(clientDataJSON) as unknown as ArrayBuffer,
        attestationObject: attestationObjectCbor,
      },
    };
  }

  /**
   * Converts a Node.js crypto public key to COSE format for WebAuthn.
   * @param {crypto.KeyObject} publicKey - The public key to convert.
   * @returns {Buffer} The public key encoded in COSE format.
   */
  private _publicKeyToCOSE(publicKey: KeyObject): Uint8Array {
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

    return encode(coseKey);
  }

  private _generateCredentialId(): Buffer {
    return Buffer.from(
      Date.now().toString() + Math.random().toString().substring(2),
    );
  }
}
