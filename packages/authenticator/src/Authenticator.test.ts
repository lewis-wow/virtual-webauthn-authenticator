import { test, describe, expect, beforeAll } from 'vitest';
import { Authenticator, IKeyPairGenerator } from './Authenticator.js';
import { generateKeyPairSync } from 'node:crypto';
import {
  RegistrationResponseJSON,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { toBuffer } from '@repo/utils/toBuffer';

describe('Authenticator', () => {
  let authenticator: Authenticator;
  const keyPairGenerator: IKeyPairGenerator = {
    generateKeyPair: () => {
      return generateKeyPairSync('ec', {
        namedCurve: 'secp256k1',
        publicKeyEncoding: {
          type: 'spki',
          format: 'der',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'der',
        },
      });
    },
  };

  beforeAll(() => {
    authenticator = new Authenticator({ keyPairGenerator });
  });

  describe('Attestation: direct', () => {
    test('createCredential()', async () => {
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
        attestation: 'direct',
      };

      const publicKeyCredentials =
        authenticator.createCredential(creationOptions);

      const responseForVerification: RegistrationResponseJSON = {
        id: publicKeyCredentials.id,
        rawId: toBuffer(publicKeyCredentials.rawId).toString('base64url'),
        response: {
          clientDataJSON: toBuffer(
            publicKeyCredentials.response.clientDataJSON,
          ).toString('base64url'),
          attestationObject: toBuffer(
            publicKeyCredentials.response.attestationObject,
          ).toString('base64url'),
        },
        type: 'public-key',
        clientExtensionResults: {},
      };

      const expectedChallenge = toBuffer(creationOptions.challenge).toString(
        'base64url',
      );

      const verification = await verifyRegistrationResponse({
        response: responseForVerification,
        expectedChallenge: expectedChallenge,
        expectedOrigin: creationOptions.rp.id!,
        expectedRPID: creationOptions.rp.id,
        requireUserVerification: false, // Authenticator doesn't perform UV
        requireUserPresence: false, // Authenticator does NOT perform UP
      });

      expect(verification.verified).toBe(true);
    });
  });

  describe('Attestation: none', () => {
    test('createCredential()', () => {
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
    });
  });
});
