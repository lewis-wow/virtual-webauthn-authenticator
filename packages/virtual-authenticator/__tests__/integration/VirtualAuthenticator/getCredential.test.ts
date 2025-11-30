import { upsertTestingUser, USER_ID } from '../../../../auth/__tests__/helpers';

import { UUIDMapper } from '@repo/core/mappers';
import { PrismaClient } from '@repo/prisma';
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { PublicKeyCredentialDtoSchema } from '../../../../contract/src/dto/credentials/components/PublicKeyCredentialDtoSchema';
import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import { UserVerificationRequirement } from '../../../src/enums/UserVerificationRequirement';
import { CredentialNotFound } from '../../../src/exceptions/CredentialNotFound';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import { IKeyProvider } from '../../../src/types/IKeyProvider';
import type { PublicKeyCredentialRequestOptions } from '../../../src/zod-validation/PublicKeyCredentialRequestOptionsSchema';
import { MockKeyProvider } from '../../helpers/MockKeyProvider';
import {
  CHALLENGE_BASE64URL,
  PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
  RP_ID,
  RP_ORIGIN,
} from '../../helpers/consts';
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
      webAuthnRepository: webAuthnCredentialRepository,
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

    const encodedPublicKeyCredential =
      PublicKeyCredentialDtoSchema.encode(publicKeyCredential);

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

  describe('PublicKeyCredentialRequestOptions.userVerification', () => {
    describe.each([
      {
        userVerification: undefined,
      },
      {
        userVerification: UserVerificationRequirement.REQUIRED,
      },
      {
        userVerification: UserVerificationRequirement.PREFERRED,
      },
      {
        userVerification: UserVerificationRequirement.DISCOURAGED,
      },
    ])('With userVerification $userVerification', ({ userVerification }) => {
      test('should produce a verifiable assertion', async () => {
        const requestOptions = createPublicKeyCredentialRequestOptions({
          credentialID: credentialRawID,
        });

        const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
          {
            ...requestOptions,
            userVerification,
          };

        const publicKeyCredential = await authenticator.getCredential({
          publicKeyCredentialRequestOptions,
          meta: {
            userId: USER_ID,
            origin: RP_ORIGIN,
          },
          context: {
            apiKeyId: undefined,
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
            id: credentialID,
            publicKey,
            counter,
          },
          requireUserVerification:
            userVerification === UserVerificationRequirement.REQUIRED,
        });

        expect(authenticationVerification.verified).toBe(true);
      });
    });

    test('should throw type mismatch when userVerification is not in enum', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions = {
        ...requestOptions,
        userVerification: 'INVALID_USER_VERIFICATION',
      };

      await expect(async () =>
        authenticator.getCredential({
          publicKeyCredentialRequestOptions:
            publicKeyCredentialRequestOptions as unknown as PublicKeyCredentialRequestOptions,
          meta: {
            userId: USER_ID,
            origin: RP_ORIGIN,
          },
          context: {
            apiKeyId: undefined,
          },
        }),
      ).rejects.toThrowError();
    });
  });

  describe('PublicKeyCredentialRequestOptions.timeout', () => {
    test.each([
      { timeout: undefined },
      { timeout: 30000 },
      { timeout: 60000 },
      { timeout: 120000 },
      { timeout: 300000 },
    ])('should work with timeout $timeout', async ({ timeout }) => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          timeout,
        };

      const publicKeyCredential = await authenticator.getCredential({
        publicKeyCredentialRequestOptions,
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
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
          id: credentialID,
          publicKey,
          counter,
        },
        requireUserVerification: true,
      });

      expect(authenticationVerification.verified).toBe(true);
    });
  });

  describe('PublicKeyCredentialRequestOptions.allowCredentials variations', () => {
    test('should work with allowCredentials as empty array', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          allowCredentials: [],
        };

      const publicKeyCredential = await authenticator.getCredential({
        publicKeyCredentialRequestOptions,
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
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
          id: credentialID,
          publicKey,
          counter,
        },
        requireUserVerification: true,
      });

      expect(authenticationVerification.verified).toBe(true);
    });

    test('should work with multiple allowCredentials including the correct one', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          allowCredentials: [
            { id: Buffer.from('WRONG_CREDENTIAL_ID_1'), type: 'public-key' },
            { id: Buffer.from('WRONG_CREDENTIAL_ID_2'), type: 'public-key' },
            ...(requestOptions.allowCredentials ?? []),
            { id: Buffer.from('WRONG_CREDENTIAL_ID_3'), type: 'public-key' },
          ],
        };

      const publicKeyCredential = await authenticator.getCredential({
        publicKeyCredentialRequestOptions,
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
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
          id: credentialID,
          publicKey,
          counter,
        },
        requireUserVerification: true,
      });

      expect(authenticationVerification.verified).toBe(true);
    });
  });

  describe('PublicKeyCredentialRequestOptions.rpId', () => {
    test('should work with explicit rpId matching the origin', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          rpId: RP_ID,
        };

      const publicKeyCredential = await authenticator.getCredential({
        publicKeyCredentialRequestOptions,
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
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
          id: credentialID,
          publicKey,
          counter,
        },
        requireUserVerification: true,
      });

      expect(authenticationVerification.verified).toBe(true);
    });

    test('should throw type mismatch when rpId is not a string', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions = {
        ...requestOptions,
        rpId: 12345,
      };

      await expect(async () =>
        authenticator.getCredential({
          publicKeyCredentialRequestOptions:
            publicKeyCredentialRequestOptions as unknown as PublicKeyCredentialRequestOptions,
          meta: {
            userId: USER_ID,
            origin: RP_ORIGIN,
          },
          context: {
            apiKeyId: undefined,
          },
        }),
      ).rejects.toThrowError();
    });
  });

  describe('Combined PublicKeyCredentialRequestOptions', () => {
    test('should work with all options combined', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          rpId: RP_ID,
          timeout: 60000,
          userVerification: UserVerificationRequirement.REQUIRED,
          allowCredentials: [
            { id: Buffer.from('WRONG_CREDENTIAL_ID_1'), type: 'public-key' },
            ...(requestOptions.allowCredentials ?? []),
          ],
        };

      const publicKeyCredential = await authenticator.getCredential({
        publicKeyCredentialRequestOptions,
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
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
          id: credentialID,
          publicKey,
          counter,
        },
        requireUserVerification: true,
      });

      expect(authenticationVerification.verified).toBe(true);
    });
  });
});
