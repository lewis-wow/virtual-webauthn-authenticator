import { test, describe, expect, beforeAll } from 'vitest';
import { Authenticator } from './Authenticator.js';
import { createSign, generateKeyPairSync } from 'node:crypto';
import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { toBuffer } from '@repo/utils/toBuffer';
import type { IPublicJsonWebKeyFactory, ISigner } from './types.js';

const keyPair = generateKeyPairSync('ec', {
  namedCurve: 'secp256k1',
});

const publicJsonWebKeyFactory: IPublicJsonWebKeyFactory = {
  getPublicJsonWebKey: () => keyPair.publicKey.export({ format: 'jwk' }),
};

const signer: ISigner = {
  sign: (data: Buffer) => {
    const signature = createSign('sha256')
      .update(data)
      .sign(keyPair.privateKey);

    return signature;
  },
};

describe('Authenticator', () => {
  let authenticator: Authenticator;

  beforeAll(() => {
    authenticator = new Authenticator({
      publicJsonWebKeyFactory,
      signer,
    });
  });

  test('createCredential() attestation: none', async () => {
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

    const publicKeyCredentials =
      await authenticator.createCredential(creationOptions);

    const expectedChallenge = toBuffer(creationOptions.challenge).toString(
      'base64url',
    );

    const verification = await verifyRegistrationResponse({
      response: publicKeyCredentials.toJSON() as RegistrationResponseJSON,
      expectedChallenge: expectedChallenge,
      expectedOrigin: creationOptions.rp.id!,
      expectedRPID: creationOptions.rp.id,
      requireUserVerification: false, // Authenticator doesn't perform UV
      requireUserPresence: false, // Authenticator does NOT perform UP
    });

    expect(verification.verified).toBe(true);
  });
});
