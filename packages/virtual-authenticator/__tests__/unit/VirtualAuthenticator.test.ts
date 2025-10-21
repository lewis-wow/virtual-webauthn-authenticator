import { COSEKey } from '@repo/keys';
import type { ICredentialPublicKey, ICredentialSigner } from '@repo/types';
import { toBuffer, interceptJsonWebKey } from '@repo/utils';
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import { createSign, generateKeyPairSync } from 'node:crypto';
import { beforeAll, describe, expect, test } from 'vitest';

import { VirtualAuthenticator } from '../../src/VirtualAuthenticator.js';

const keyPair = generateKeyPairSync('ec', {
  namedCurve: 'P-256',
});

const credentialPublicKey: ICredentialPublicKey = {
  getJwk: () =>
    interceptJsonWebKey(keyPair.publicKey.export({ format: 'jwk' })),
};

const credentialSigner: ICredentialSigner = {
  sign: (data: Buffer) => {
    const signature = createSign('sha256')
      .update(data)
      .sign(keyPair.privateKey);

    return signature;
  },
};

const createPublicKeyCredentialRequestOptions = (
  credentialID: Buffer,
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
  let publicKeyCredentials: PublicKeyCredential<IAuthenticatorAttestationResponse>;
  let registrationVerification: VerifiedRegistrationResponse;
  let expectedChallenge: string;

  const creationOptions: IPublicKeyCredentialCreationOptions = {
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

  beforeAll(async () => {
    authenticator = new VirtualAuthenticator({
      credentialPublicKey,
      credentialSigner,
    });

    publicKeyCredentials =
      await authenticator.createCredential(creationOptions);

    expectedChallenge = toBuffer(creationOptions.challenge).toString(
      'base64url',
    );

    registrationVerification = await verifyRegistrationResponse({
      response: publicKeyCredentials.toJSON() as RegistrationResponseJSON,
      expectedChallenge: expectedChallenge,
      expectedOrigin: creationOptions.rp.id!,
      expectedRPID: creationOptions.rp.id,
      requireUserVerification: true, // Authenticator does perform UV
      requireUserPresence: false, // Authenticator does NOT perform UP
    });
  });

  test('createCredential()', async () => {
    expect(registrationVerification.registrationInfo?.credential.counter).toBe(
      0,
    );

    expect(
      COSEKey.fromBuffer(
        registrationVerification.registrationInfo!.credential.publicKey,
      ).toJwk(),
    ).toMatchObject(keyPair.publicKey.export({ format: 'jwk' }));

    expect(registrationVerification.verified).toBe(true);
  });

  test('getCredential()', async () => {
    const {
      id: credentialID,
      publicKey: credentialPublicKey,
      counter: credentialCounter,
    } = registrationVerification.registrationInfo!.credential;

    const requestOptions = createPublicKeyCredentialRequestOptions(
      toBuffer(credentialID),
    );

    const assertionCredential =
      await authenticator.getCredential(requestOptions);

    const authenticationVerification = await verifyAuthenticationResponse({
      response: assertionCredential.toJSON() as AuthenticationResponseJSON,
      expectedChallenge: toBuffer(requestOptions.challenge).toString(
        'base64url',
      ),
      expectedOrigin: requestOptions.rpId!,
      expectedRPID: requestOptions.rpId!,
      credential: {
        id: credentialID,
        publicKey: credentialPublicKey,
        counter: credentialCounter,
      },
      requireUserVerification: true,
    });

    // The most important check: confirm that the authentication was successful.
    expect(authenticationVerification.verified).toBe(true);

    // A critical security check: ensure the signature counter has incremented.
    // This prevents replay attacks. The server must store this new value.
    expect(authenticationVerification.authenticationInfo.newCounter).toBe(1);
  });
});
