import {
  CHALLENGE_BASE64URL,
  RP_ORIGIN,
  PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
  RP_ID,
  USER_ID,
} from '@repo/core/__tests__/helpers';
import { upsertTestingUser } from '@repo/prisma/__tests__/helpers';

import { UUIDMapper } from '@repo/core/mappers';
import { PrismaClient } from '@repo/prisma';
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { Schema } from 'effect';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import { CredentialNotFound } from '../../../src/exceptions/CredentialNotFound';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import { IKeyProvider } from '../../../src/types/IKeyProvider';
import type { PublicKeyCredentialRequestOptions } from '../../../src/validation/PublicKeyCredentialRequestOptionsSchema';
import { PublicKeyCredentialSchema } from '../../../src/validation/PublicKeyCredentialSchema';
import { MockKeyProvider } from '../../helpers';
import { createPublicKeyCredentialRequestOptions } from '../../helpers/createPublicKeyCredentialRequestOptions';

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
    meta: {
      userId: USER_ID,
      origin: RP_ORIGIN,
    },
    context: {
      apiKeyId: undefined,
    },
  });

  const authenticationVerification = await verifyAuthenticationResponse({
    response: Schema.encodeSync(PublicKeyCredentialSchema)(
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
  let keyProvider: IKeyProvider;
  let authenticator: VirtualAuthenticator;
  const webAuthnCredentialRepository = new PrismaWebAuthnRepository({
    prisma,
  });

  let credentialID: string;
  let credentialRawID: Uint8Array;
  let counter: number;
  let publicKey: Uint8Array<ArrayBuffer>;

  beforeAll(async () => {
    await cleanup();

    // Ensure the standard testing user exists in the database.
    await upsertTestingUser({ prisma });

    keyProvider = new MockKeyProvider();

    // Initialize the VirtualAuthenticator instance, passing in the Prisma client
    // for database interactions.
    authenticator = new VirtualAuthenticator({
      repository: webAuthnCredentialRepository,
      keyProvider,
    });

    // Simulate the full WebAuthn registration ceremony.
    // This creates a new public key credential (passkey) using the
    // specified options, public key, and key vault metadata.
    const publicKeyCredential = await authenticator.createCredential({
      publicKeyCredentialCreationOptions:
        PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
      meta: {
        userId: USER_ID,
        origin: RP_ORIGIN,
      },
      context: {
        apiKeyId: null,
      },
    });

    const encodedPublicKeyCredential = Schema.encodeSync(
      PublicKeyCredentialSchema,
    )(publicKeyCredential);

    const registrationVerification = await verifyRegistrationResponse({
      response: encodedPublicKeyCredential as RegistrationResponseJSON,
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

    const rpId = 'WRONG_RP_ID';

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
      {
        ...requestOptions,
        rpId,
      };

    await expect(() =>
      authenticator.getCredential({
        publicKeyCredentialRequestOptions,
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
        },
      }),
    ).to.rejects.toThrowError(
      new CredentialNotFound({
        data: {
          userId: USER_ID,
          rpId,
          allowCredentialIds: requestOptions.allowCredentials.map(
            (allowCredential) => UUIDMapper.bytesToUUID(allowCredential.id),
          ),
        },
      }),
    );
  });

  test('should fail with different user ID', async () => {
    const publicKeyCredentialRequestOptions =
      createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

    const userId = 'WRONG_USER_ID';

    await expect(() =>
      authenticator.getCredential({
        publicKeyCredentialRequestOptions,
        meta: {
          userId,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
        },
      }),
    ).to.rejects.toThrowError(
      new CredentialNotFound({
        data: {
          userId,
          rpId: RP_ID,
          allowCredentialIds:
            publicKeyCredentialRequestOptions.allowCredentials.map(
              (allowCredential) => UUIDMapper.bytesToUUID(allowCredential.id),
            ),
        },
      }),
    );
  });

  test('should fail with wrong allowCredentials', async () => {
    const requestOptions = createPublicKeyCredentialRequestOptions({
      credentialID: credentialRawID,
    });

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
      {
        ...requestOptions,
        allowCredentials: [
          { id: Buffer.from('WRONG_CREDENTIAL_ID'), type: 'public-key' },
        ],
      };

    await expect(() =>
      authenticator.getCredential({
        publicKeyCredentialRequestOptions,
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
        },
      }),
    ).to.rejects.toThrowError(
      new CredentialNotFound({
        data: {
          userId: USER_ID,
          rpId: RP_ID,
          allowCredentialIds: [
            UUIDMapper.bytesToUUID(Buffer.from('WRONG_CREDENTIAL_ID')),
          ],
        },
      }),
    );
  });
});
