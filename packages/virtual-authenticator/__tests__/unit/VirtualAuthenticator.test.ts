import { test, describe, expect, beforeAll } from 'vitest';
import { VirtualAuthenticator } from '../../src/VirtualAuthenticator.js';
import { createSign, generateKeyPairSync } from 'node:crypto';
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { toBuffer } from '@repo/utils/toBuffer';
import type { IPublicJsonWebKeyFactory, ISigner } from '../../src/types.js';
import { CoseKey } from '@repo/keys';

const keyPair = generateKeyPairSync('ec', {
  namedCurve: 'P-256',
});

const publicJsonWebKeyFactory: IPublicJsonWebKeyFactory = {
  getPublicJsonWebKey: () => {
    return keyPair.publicKey.export({ format: 'jwk' });
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

const createPublicKeyCredentialRequestOptions = (
  credentialID: BufferSource,
): PublicKeyCredentialRequestOptions => ({
  challenge: Buffer.from('b'.repeat(32)), // A different dummy challenge for get
  rpId: 'localhost',
  allowCredentials: [
    {
      id: credentialID,
      type: 'public-key',
    },
  ],
  userVerification: 'required',
});

describe('VirtualAuthenticator', () => {
  let authenticator: VirtualAuthenticator;

  beforeAll(() => {
    authenticator = new VirtualAuthenticator({
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

    expect(
      CoseKey.fromBuffer(
        verification.registrationInfo!.credential.publicKey,
      ).toJwk(),
    ).toMatchObject(keyPair.publicKey.export({ format: 'jwk' }));

    expect(verification.verified).toBe(true);
  });

  test('getCredential() should create a valid assertion for an existing credential', async () => {
    // ARRANGE: First, create and verify a credential to use for authentication.
    const creationOptions = createPublicKeyCredentialCreationOptions();
    const registrationCredential =
      await authenticator.createCredential(creationOptions);

    const registrationVerification = await verifyRegistrationResponse({
      response: registrationCredential.toJSON() as RegistrationResponseJSON,
      expectedChallenge: toBuffer(creationOptions.challenge).toString(
        'base64url',
      ),
      expectedOrigin: creationOptions.rp.id!,
      expectedRPID: creationOptions.rp.id!,
      requireUserPresence: false,
      requireUserVerification: true,
    });

    expect(registrationVerification.verified, 'Registration failed').toBe(true);

    const {
      id: credentialID,
      publicKey: credentialPublicKey,
      counter: credentialCounter,
    } = registrationVerification.registrationInfo!.credential;

    // Prepare the options for the get() call using the newly created credential ID.
    const requestOptions = createPublicKeyCredentialRequestOptions(
      toBuffer(credentialID),
    );

    // ACT: Perform the authentication ceremony.
    const assertionCredential =
      await authenticator.getCredential(requestOptions);

    // ASSERT: Verify the assertion response.
    const expectedChallenge = toBuffer(requestOptions.challenge).toString(
      'base64url',
    );

    const authenticationVerification = await verifyAuthenticationResponse({
      response:
        assertionCredential.toJSON() as unknown as AuthenticationResponseJSON,
      expectedChallenge,
      expectedOrigin: requestOptions.rpId!,
      expectedRPID: requestOptions.rpId!,
      credential: {
        id: credentialID,
        publicKey: credentialPublicKey,
        counter: credentialCounter,
      },
      // The flags in the getCredential() implementation are set to: User Present (1), User Verified (1)
      requireUserVerification: true,
    });

    expect(authenticationVerification.verified).toBe(true);
    // The counter should have incremented from 0 to 1.
    expect(authenticationVerification.authenticationInfo.newCounter).toBe(1);
  });
});
