import { WebAuthnCredentialKeyMetaType } from '@repo/enums';
import { PrismaClient } from '@repo/prisma';
import {
  CHALLENGE_BASE64URL,
  createPublicKeyCredentialRequestOptions,
  KEY_VAULT_KEY_ID,
  KEY_VAULT_KEY_NAME,
  RP_ORIGIN,
  PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
  RP_ID,
  upsertTestingUser,
  USER_ID,
} from '@repo/test-helpers';
import {
  PublicKeyCredentialDtoSchema,
  PublicKeyCredentialRequestOptions,
} from '@repo/validation';
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import { credentialSigner } from '../../helpers/credentialSigner';
import { COSEPublicKey } from '../../helpers/key';

const prisma = new PrismaClient();

/**
 * Helper function to de-duplicate the authentication and verification logic.
 * It uses and updates the `currentCounter` from the describe block's scope.
 */
const performAndVerifyAuth = async (opts: {
  authenticator: VirtualAuthenticator;
  requestOptions: PublicKeyCredentialRequestOptions;
  id: string;
  publicKey: Uint8Array<ArrayBuffer>;
  counter: number;
  expectedNewCounter: number;
}) => {
  const {
    authenticator,
    requestOptions,
    id,
    publicKey,
    counter,
    expectedNewCounter,
  } = opts;

  const publicKeyCredential = await authenticator.getCredential({
    publicKeyCredentialRequestOptions: requestOptions,
    signatureFactory: ({ data }) => credentialSigner.sign(data),
    meta: {
      userId: USER_ID,
      origin: RP_ORIGIN,
    },
  });

  const authenticationVerification = await verifyAuthenticationResponse({
    response: PublicKeyCredentialDtoSchema.encode(
      publicKeyCredential,
    ) as AuthenticationResponseJSON,
    expectedChallenge: CHALLENGE_BASE64URL,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id,
      publicKey,
      counter,
    },
    requireUserVerification: true,
  });

  // The most important check: confirm that the authentication was successful.
  expect(authenticationVerification.verified).toBe(true);

  // A critical security check: ensure the signature counter has incremented.
  expect(authenticationVerification.authenticationInfo.newCounter).toBe(
    expectedNewCounter,
  );
};

const cleanup = async () => {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.webAuthnCredential.deleteMany(),
    prisma.webAuthnCredentialKeyVaultKeyMeta.deleteMany(),
  ]);
};

describe('VirtualAuthenticator.getCredential()', () => {
  let authenticator: VirtualAuthenticator;

  let credentialID: string;
  let credentialRawID: Uint8Array;
  let counter: number;
  let publicKey: Uint8Array<ArrayBuffer>;

  beforeAll(async () => {
    await cleanup();

    // Ensure the standard testing user exists in the database.
    await upsertTestingUser({ prisma });

    // Initialize the VirtualAuthenticator instance, passing in the Prisma client
    // for database interactions.
    authenticator = new VirtualAuthenticator({ prisma });

    // Simulate the full WebAuthn registration ceremony.
    // This creates a new public key credential (passkey) using the
    // specified options, public key, and key vault metadata.
    const publicKeyCredential = await authenticator.createCredential({
      publicKeyCredentialCreationOptions:
        PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
      generateKeyPair: async () => ({
        COSEPublicKey: COSEPublicKey.toBuffer(),
        webAuthnCredentialKeyMetaType: WebAuthnCredentialKeyMetaType.KEY_VAULT,
        webAuthnCredentialKeyVaultKeyMeta: {
          keyVaultKeyId: KEY_VAULT_KEY_ID,
          keyVaultKeyName: KEY_VAULT_KEY_NAME,
          hsm: false,
        },
      }),
      signatureFactory: ({ data }) => credentialSigner.sign(data),
      meta: {
        userId: USER_ID,
        origin: RP_ORIGIN,
      },
    });

    const registrationVerification = await verifyRegistrationResponse({
      response: PublicKeyCredentialDtoSchema.encode(
        publicKeyCredential,
      ) as RegistrationResponseJSON,
      expectedChallenge: CHALLENGE_BASE64URL,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true, // Authenticator does perform UV
      requireUserPresence: false, // Authenticator does NOT perform UP
    });

    publicKey = registrationVerification.registrationInfo!.credential.publicKey;
    credentialID = registrationVerification.registrationInfo!.credential.id;
    counter = registrationVerification.registrationInfo!.credential.counter;
    credentialRawID = publicKeyCredential.rawId;
  });

  afterAll(async () => {
    await cleanup();
  });

  test('should produce a verifiable assertion', async () => {
    const requestOptions = createPublicKeyCredentialRequestOptions({
      credentialID: credentialRawID,
    });

    await performAndVerifyAuth({
      authenticator,
      requestOptions,
      id: credentialID,
      publicKey,
      counter,
      expectedNewCounter: 1,
    });
  });

  test('should produce a verifiable assertion without allowCredentials', async () => {
    const requestOptions = createPublicKeyCredentialRequestOptions({
      credentialID: credentialRawID,
    });

    await performAndVerifyAuth({
      authenticator,
      requestOptions: {
        ...requestOptions,
        allowCredentials: undefined,
      },
      id: credentialID,
      publicKey,
      counter,
      expectedNewCounter: 2,
    });
  });

  test('should produce a verifiable assertion with redundant allowCredentials', async () => {
    const requestOptions = createPublicKeyCredentialRequestOptions({
      credentialID: credentialRawID,
    });

    await performAndVerifyAuth({
      authenticator,
      requestOptions: {
        ...requestOptions,
        allowCredentials: [
          { id: Buffer.from('WRONG_CREDENTIAL_ID'), type: 'public-key' },
          ...(requestOptions.allowCredentials ?? []),
        ],
      },
      id: credentialID,
      publicKey,
      counter,
      expectedNewCounter: 3,
    });
  });

  test('should fail with different RP ID', async () => {
    const requestOptions = createPublicKeyCredentialRequestOptions({
      credentialID: credentialRawID,
    });

    await expect(() =>
      authenticator.getCredential({
        publicKeyCredentialRequestOptions: {
          ...requestOptions,
          rpId: 'WRONG_RP_ID',
        },
        signatureFactory: ({ data }) => credentialSigner.sign(data),
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
      }),
    ).to.rejects.toThrowError();
  });

  test('should fail with different user ID', async () => {
    const requestOptions = createPublicKeyCredentialRequestOptions({
      credentialID: credentialRawID,
    });

    await expect(() =>
      authenticator.getCredential({
        publicKeyCredentialRequestOptions: requestOptions,
        signatureFactory: ({ data }) => credentialSigner.sign(data),
        meta: {
          userId: 'WRONG_USER_ID',
          origin: RP_ORIGIN,
        },
      }),
    ).to.rejects.toThrowError();
  });

  test('should fail with wrong allowCredentials', async () => {
    const requestOptions = createPublicKeyCredentialRequestOptions({
      credentialID: credentialRawID,
    });

    await expect(() =>
      authenticator.getCredential({
        publicKeyCredentialRequestOptions: {
          ...requestOptions,
          allowCredentials: [
            { id: Buffer.from('WRONG_CREDENTIAL_ID'), type: 'public-key' },
          ],
        },
        signatureFactory: ({ data }) => credentialSigner.sign(data),
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
      }),
    ).to.rejects.toThrowError();
  });
});
