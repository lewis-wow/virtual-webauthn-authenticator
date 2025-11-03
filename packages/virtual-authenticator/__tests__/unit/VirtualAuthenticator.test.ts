import { COSEKey } from '@repo/keys';
import {
  CHALLENGE_BASE64URL,
  CHALLENGE_RAW,
  RP_ID,
  RP_NAME,
  USER_DISPLAY_NAME,
  USER_ID_RAW,
  USER_NAME,
} from '@repo/test-helpers';
import { uuidToBuffer } from '@repo/utils';
import {
  PublicKeyCredentialRequestOptions,
  PublicKeyCredential,
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialSchema,
} from '@repo/validation';
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, test } from 'vitest';

import { VirtualAuthenticator } from '../../src/VirtualAuthenticator.js';
import { credentialSigner } from '../helpers/credentialSigner.js';
import { COSEPublicKey, keyPair } from '../helpers/key.js';

const createPublicKeyCredentialRequestOptions = (
  credentialID: Buffer,
): PublicKeyCredentialRequestOptions => ({
  challenge: CHALLENGE_RAW,
  rpId: RP_ID,
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
  let publicKeyCredentials: PublicKeyCredential;
  let registrationVerification: VerifiedRegistrationResponse;
  let expectedChallenge: string;

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
    {
      rp: {
        name: RP_NAME,
        id: RP_ID,
      },
      user: {
        id: USER_ID_RAW,
        name: USER_NAME,
        displayName: USER_DISPLAY_NAME,
      },
      challenge: CHALLENGE_RAW,
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: 60000,
      attestation: 'none',
    };

  beforeAll(async () => {
    authenticator = new VirtualAuthenticator();

    publicKeyCredentials = await authenticator.createCredential({
      publicKeyCredentialCreationOptions,
      COSEPublicKey,
      meta: {
        credentialID: uuidToBuffer(randomUUID()),
      },
    });

    expectedChallenge =
      publicKeyCredentialCreationOptions.challenge.toString('base64url');

    registrationVerification = await verifyRegistrationResponse({
      response: PublicKeyCredentialSchema.encode(
        publicKeyCredentials,
      ) as RegistrationResponseJSON,
      expectedChallenge: expectedChallenge,
      expectedOrigin: publicKeyCredentialCreationOptions.rp.id!,
      expectedRPID: publicKeyCredentialCreationOptions.rp.id,
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

    const publicKeyCredentialRequestOptions =
      createPublicKeyCredentialRequestOptions(Buffer.from(credentialID));

    const assertionCredential = await authenticator.getCredential({
      publicKeyCredentialRequestOptions,
      COSEPublicKey,
      credentialSigner,
      meta: {
        counter: 1,
        credentialID: Buffer.from(credentialID, 'base64url'),
      },
    });

    const authenticationVerification = await verifyAuthenticationResponse({
      response: PublicKeyCredentialSchema.encode(
        assertionCredential,
      ) as AuthenticationResponseJSON,
      expectedChallenge: CHALLENGE_BASE64URL,
      expectedOrigin: RP_ID,
      expectedRPID: RP_ID,
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
