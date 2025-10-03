/**
 * A Node.js-based Virtual WebAuthn Authenticator for Simulation (TypeScript Version).
 * * **WARNING:** This is NOT a real authenticator and provides NO security guarantees.
 * It is intended for specialized testing, research, or simulation purposes where
 * you need to generate cryptographically valid WebAuthn structures on a server.
 * It does not prove user presence, is not tied to hardware, and is not phishing-resistant.
 * DO NOT USE THIS FOR REAL AUTHENTICATION.
 * * To run this, you need to install dependencies:
 * npm install typescript ts-node cbor @simplewebauthn/server @types/node @types/cbor
 * * Then run with:
 * ts-node virtual-authenticator.ts
 */
import { createHash, createSign, generateKeyPairSync, KeyObject } from 'crypto';
import cbor from 'cbor';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { RegistrationResponseJSON } from '@simplewebauthn/types';

// --- START: WebAuthn Standard Interfaces ---

interface PublicKeyCredentialRpEntity {
  id: string;
  name: string;
}

interface PublicKeyCredentialUserEntity {
  id: Buffer;
  name: string;
  displayName: string;
}

interface PublicKeyCredentialCreationOptions {
  rp: PublicKeyCredentialRpEntity;
  user: PublicKeyCredentialUserEntity;
  challenge: Buffer;
  pubKeyCredParams: { type: 'public-key'; alg: number }[];
  timeout?: number;
  attestation?: 'none' | 'indirect' | 'direct';
}

interface PublicKeyCredential {
  id: string;
  rawId: Buffer;
  type: 'public-key';
  response: {
    clientDataJSON: Buffer;
    attestationObject: Buffer;
  };
}

// --- END: WebAuthn Standard Interfaces ---

class VirtualAuthenticator {
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
      challenge: this._bufferToBase64Url(options.challenge),
      origin: `https://${options.rp.id}`, // Simulating the origin
      crossOrigin: false,
    };
    const clientDataJSON = JSON.stringify(clientData);

    // 5. Create the Attestation Statement
    // For 'none' attestation format, the attestation statement MUST be an empty map.
    const attestationStatement = new Map();

    // Use an explicit Map for the attestationObject
    const attestationObject = new Map<string, any>([
      ['fmt', 'none'],
      ['attStmt', attestationStatement],
      ['authData', authData],
    ]);

    // 6. Assemble the final PublicKeyCredential object
    const attestationObjectCbor = cbor.encode(attestationObject);

    return {
      id: this._bufferToBase64Url(this.credentialID),
      rawId: this.credentialID,
      type: 'public-key',
      response: {
        clientDataJSON: Buffer.from(clientDataJSON),
        attestationObject: attestationObjectCbor,
      },
    };
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

  private _generateCredentialId(): Buffer {
    return Buffer.from(
      Date.now().toString() + Math.random().toString().substring(2),
    );
  }

  private _bufferToBase64Url(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

// --- EXAMPLE USAGE ---
async function main() {
  console.log(
    '--- Simulating WebAuthn Credential Creation in Node.js (TypeScript) ---',
  );

  const creationOptions: PublicKeyCredentialCreationOptions = {
    rp: {
      name: 'My Simulated Service',
      id: 'localhost',
    },
    user: {
      id: Buffer.from('user123'),
      name: 'testuser@example.com',
      displayName: 'Test User',
    },
    challenge: Buffer.from('a'.repeat(32)), // A dummy challenge
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    timeout: 60000,
    attestation: 'none',
  };

  console.log('\n[INPUT] Standard creation options:');
  console.dir(creationOptions, { depth: null });

  const authenticator = new VirtualAuthenticator();
  const createdCredential = authenticator.createCredential(creationOptions);

  console.log(
    '\n[OUTPUT] Generated PublicKeyCredential object (in standard format):',
  );
  console.log('ID:', createdCredential.id);
  console.log('Type:', createdCredential.type);
  console.log('Raw ID (Buffer):', createdCredential.rawId);
  console.log(
    'Response (clientDataJSON as string):',
    createdCredential.response.clientDataJSON.toString(),
  );
  console.log(
    'Response (attestationObject as Buffer):',
    createdCredential.response.attestationObject,
  );

  console.log(
    "\n--- Verifying the created credential using '@simplewebauthn/server' ---",
  );

  try {
    const expectedChallenge = this._bufferToBase64Url(
      creationOptions.challenge,
    );

    // The verifyRegistrationResponse function expects a JSON-serializable object.
    // We convert our Buffers to base64url strings to match the expected format from a browser.
    const responseForVerification: RegistrationResponseJSON = {
      id: createdCredential.id,
      rawId: this._bufferToBase64Url(createdCredential.rawId),
      response: {
        clientDataJSON: this._bufferToBase64Url(
          createdCredential.response.clientDataJSON,
        ),
        attestationObject: this._bufferToBase64Url(
          createdCredential.response.attestationObject,
        ),
      },
      type: 'public-key',
      clientExtensionResults: {},
    };

    const verification = await verifyRegistrationResponse({
      response: responseForVerification,
      expectedChallenge: expectedChallenge,
      expectedOrigin: `https://${creationOptions.rp.id}`,
      expectedRPID: creationOptions.rp.id,
      requireUserVerification: false, // Our authenticator doesn't perform UV
      requireUserPresence: false, // Our authenticator does NOT perform UP
    });

    if (verification.verified) {
      console.log('\n[SUCCESS] Verification successful!');
      console.log('\nVerification details:');
      console.dir(verification, { depth: null });
    } else {
      console.error('\n[FAILURE] Verification failed.', verification);
    }
  } catch (error: any) {
    console.error('\n[ERROR] An error occurred during verification:');
    console.error(error.message);
    console.error(error);
  }
}

/**
 * Helper to convert buffer to base64url
 */
function _bufferToBase64Url(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Wrapping main call in a function to use `this` for helper
function run() {
  main.bind({ _bufferToBase64Url })();
}

run();
