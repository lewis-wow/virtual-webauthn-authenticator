import { test, describe, expect, beforeAll } from 'vitest';
import { Authenticator } from './VirtualAuthenticator.js';
import { createSign, generateKeyPairSync } from 'node:crypto';
import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { toBuffer } from '@repo/utils/toBuffer';
import type { IPublicJsonWebKeyFactory, ISigner } from './types.js';

const keyPair = generateKeyPairSync('ec', {
  namedCurve: 'P-256',
});

const publicJsonWebKeyFactory: IPublicJsonWebKeyFactory = {
  getPublicJsonWebKey: () => {
    const jwk = keyPair.publicKey.export({ format: 'jwk' });
    jwk.alg = 'ES256';
    return jwk;
  },
};

const signer: ISigner = {
  sign: (data: Buffer) => {
    const signature = createSign('sha256')
      .update(data)
      .sign(keyPair.privateKey);

    return signature;
  },
};

const createPublicKeyCredentialCreationOptions = (
  overrides?: Partial<PublicKeyCredentialCreationOptions>,
): PublicKeyCredentialCreationOptions => ({
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
  ...overrides,
});

describe('Authenticator', () => {
  let authenticator: Authenticator;

  beforeAll(() => {
    authenticator = new Authenticator({
      publicJsonWebKeyFactory,
      signer,
    });
  });

  test('createCredential() attestation: none', async () => {
    const creationOptions = createPublicKeyCredentialCreationOptions();

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
      requireUserVerification: true, // Authenticator does perform UV
      requireUserPresence: false, // Authenticator does NOT perform UP
    });

    expect(verification.registrationInfo?.credential.counter).toBe(0);
    expect(verification.registrationInfo?.credential.publicKey).toEqual(
      keyPair.publicKey.export({ type: 'spki', format: 'der' }),
    );
    expect(verification.verified).toBe(true);
  });

  test('createCredential() attestation: direct', async () => {
    const creationOptions = createPublicKeyCredentialCreationOptions({
      attestation: 'direct',
    });

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
      requireUserVerification: true, // Authenticator does perform UV
      requireUserPresence: false, // Authenticator does NOT perform UP
    });

    expect(verification.verified).toBe(true);
  });
});
