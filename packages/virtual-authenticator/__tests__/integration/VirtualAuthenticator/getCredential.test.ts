import { upsertTestingUser, USER_ID } from '../../../../auth/__tests__/helpers';

import { UUIDMapper } from '@repo/core/mappers';
import { PrismaClient } from '@repo/prisma';
import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { randomBytes } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { PublicKeyCredentialDtoSchema } from '../../../../contract/src/dto/credentials/components/PublicKeyCredentialDtoSchema';
import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import { PublicKeyCredentialType } from '../../../src/enums/PublicKeyCredentialType';
import { UserVerificationRequirement } from '../../../src/enums/UserVerificationRequirement';
import { CredentialNotFound } from '../../../src/exceptions/CredentialNotFound';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import { IKeyProvider } from '../../../src/types/IKeyProvider';
import type { PublicKeyCredentialRequestOptions } from '../../../src/zod-validation/PublicKeyCredentialRequestOptionsSchema';
import { KeyVaultKeyIdGenerator } from '../../helpers/KeyVaultKeyIdGenerator';
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

    const keyVaultKeyIdGenerator = new KeyVaultKeyIdGenerator();
    keyProvider = new MockKeyProvider({ keyVaultKeyIdGenerator });

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

  /**
   * Tests for userVerification parameter
   * @see https://www.w3.org/TR/webauthn-3/#enum-userVerificationRequirement
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-userverification
   *
   * Per spec: This member specifies the Relying Party's requirements regarding user verification.
   * - 'required': The RP requires user verification for the operation.
   * - 'preferred': The RP prefers user verification if possible, but will accept the operation without it.
   * - 'discouraged': The RP does not want user verification employed during the operation.
   */
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

        // Per spec, if userVerification is 'required', the UV flag must be set
        if (userVerification === UserVerificationRequirement.REQUIRED) {
          expect(
            authenticationVerification.authenticationInfo.userVerified,
          ).toBe(true);
        }
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

  /**
   * Tests for challenge validation
   * @see https://www.w3.org/TR/webauthn-3/#sctn-cryptographic-challenges
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-challenge
   *
   * Per spec: "Challenges SHOULD contain enough entropy to make guessing them infeasible.
   * Challenges SHOULD therefore be at least 16 bytes long."
   */
  describe('PublicKeyCredentialRequestOptions.challenge', () => {
    test('should work with challenge exactly 16 bytes (minimum recommended)', async () => {
      const challenge = new Uint8Array(16);
      crypto.getRandomValues(challenge);

      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          challenge,
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
        expectedChallenge: Buffer.from(challenge).toString('base64url'),
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

    test('should fail with challenge less than 16 bytes (spec recommends at least 16)', async () => {
      const challenge = new Uint8Array(15);
      crypto.getRandomValues(challenge);

      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions = {
        ...requestOptions,
        challenge,
      };

      await expect(async () =>
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
      ).rejects.toThrowError();
    });

    test('should fail with empty challenge (0 bytes)', async () => {
      const challenge = new Uint8Array(0);

      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions = {
        ...requestOptions,
        challenge,
      };

      await expect(async () =>
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
      ).rejects.toThrowError();
    });

    test('should work with very large challenge (1024 bytes)', async () => {
      const challenge = new Uint8Array(1024);
      crypto.getRandomValues(challenge);

      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          challenge,
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
        expectedChallenge: Buffer.from(challenge).toString('base64url'),
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

    test('should fail when challenge is not Uint8Array', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions = {
        ...requestOptions,
        challenge: 'not-a-uint8array',
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

  /**
   * Tests for extensions
   * @see https://www.w3.org/TR/webauthn-3/#sctn-extensions
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-authenticationextensionsclientinputs
   *
   * Per spec: Extensions are optional and provide additional functionality.
   * Unknown extensions should be ignored by the authenticator.
   */
  describe('PublicKeyCredentialRequestOptions.extensions', () => {
    test('should work with undefined extensions', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          extensions: undefined,
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

    test('should work with empty extensions object', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          extensions: {},
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

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-appid-extension
     * Per spec: appid extension allows authentication with credentials registered with FIDO U2F
     */
    test('should work with appid extension', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          extensions: {
            appid: 'https://example.com/appid.json',
          },
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

    /**
     * @see https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-errata-20220621.html#sctn-hmac-secret-extension
     * Per CTAP2: hmac-secret extension for symmetric secret operations
     */
    test('should work with hmac-secret extension', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          extensions: {
            'hmac-secret': {
              salt1: new Uint8Array(32),
              salt2: new Uint8Array(32),
            },
          },
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

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-large-blob-extension
     * Per spec: largeBlob extension for reading/writing large blob data
     */
    test('should work with largeBlob extension (read)', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          extensions: {
            largeBlob: {
              read: true,
            },
          },
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

    test('should work with largeBlob extension (write)', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          extensions: {
            largeBlob: {
              write: new Uint8Array([1, 2, 3, 4, 5]),
            },
          },
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

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-extensions
     * Per spec: "Authenticators MUST ignore any extensions that they do not recognize."
     */
    test('should ignore unknown/unsupported extensions', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          extensions: {
            unknownExtension: 'some-value',
            anotherUnknown: { complex: 'object' },
          },
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

      // Per spec, unknown extensions should be ignored, not cause errors
      expect(authenticationVerification.verified).toBe(true);
    });

    test('should work with multiple extensions combined', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          ...requestOptions,
          extensions: {
            appid: 'https://example.com/appid.json',
            largeBlob: {
              read: true,
            },
            unknownExtension: 'ignored',
          },
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

  /**
   * Tests for edge cases and overall spec compliance
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialrequestoptions
   *
   * These tests verify boundary conditions and ensure the implementation
   * handles both minimal valid inputs and maximum complexity scenarios
   */
  describe('Edge Cases and Spec Compliance', () => {
    /**
     * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialrequestoptions
     * Required field: challenge
     * Optional fields: timeout, rpId, allowCredentials, userVerification, extensions
     */
    test('should work with minimal valid options (only required field)', async () => {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Only required field per spec is challenge
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          challenge,
          rpId: RP_ID,
          // All optional fields omitted: timeout, allowCredentials, userVerification, extensions
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
        expectedChallenge: Buffer.from(challenge).toString('base64url'),
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: credentialID,
          publicKey,
          counter,
        },
        requireUserVerification: false,
      });

      expect(authenticationVerification.verified).toBe(true);
    });

    test('should work with all fields at maximum complexity', async () => {
      const largeChallenge = new Uint8Array(1024);
      crypto.getRandomValues(largeChallenge);

      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          challenge: largeChallenge,
          rpId: RP_ID,
          timeout: 300000,
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: Buffer.from('WRONG_CREDENTIAL_ID_1'),
            },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: Buffer.from('WRONG_CREDENTIAL_ID_2'),
            },
            ...(requestOptions.allowCredentials ?? []),
          ],
          userVerification: UserVerificationRequirement.REQUIRED,
          extensions: {
            appid: 'https://example.com/appid.json',
            largeBlob: {
              read: true,
            },
            unknownExtension: 'ignored',
          },
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
        expectedChallenge: Buffer.from(largeChallenge).toString('base64url'),
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

    test('should fail with completely malformed options', async () => {
      const malformedOptions = {
        notValid: 'options',
      };

      await expect(async () =>
        authenticator.getCredential({
          publicKeyCredentialRequestOptions:
            malformedOptions as unknown as PublicKeyCredentialRequestOptions,
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

    test('should fail with null in required field', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions = {
        ...requestOptions,
        challenge: null,
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

    test('should fail with missing challenge', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const publicKeyCredentialRequestOptions = {
        ...requestOptions,
        challenge: undefined,
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

  /**
   * Tests for authenticator signature counter
   * @see https://www.w3.org/TR/webauthn-3/#sctn-sign-counter
   * @see https://www.w3.org/TR/webauthn-3/#signature-counter
   *
   * Per spec: The signature counter is a security feature that helps detect cloned authenticators.
   * It should increment with each assertion operation.
   */
  describe('Signature Counter Verification', () => {
    test('should increment counter with each assertion', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      // First assertion
      let publicKeyCredential = await authenticator.getCredential({
        publicKeyCredentialRequestOptions: requestOptions,
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
        },
      });

      let authenticationVerification = await verifyAuthenticationResponse({
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
      const firstCounter =
        authenticationVerification.authenticationInfo.newCounter;
      expect(firstCounter).toBeGreaterThan(counter);

      // Second assertion - counter should increment again
      publicKeyCredential = await authenticator.getCredential({
        publicKeyCredentialRequestOptions: requestOptions,
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
        },
      });

      authenticationVerification = await verifyAuthenticationResponse({
        response: PublicKeyCredentialDtoSchema.encode(
          publicKeyCredential,
        ) as AuthenticationResponseJSON,
        expectedChallenge: CHALLENGE_BASE64URL,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: credentialID,
          publicKey,
          counter: firstCounter,
        },
        requireUserVerification: true,
      });

      expect(authenticationVerification.verified).toBe(true);
      const secondCounter =
        authenticationVerification.authenticationInfo.newCounter;
      expect(secondCounter).toBeGreaterThan(firstCounter);

      // Third assertion - counter should increment yet again
      publicKeyCredential = await authenticator.getCredential({
        publicKeyCredentialRequestOptions: requestOptions,
        meta: {
          userId: USER_ID,
          origin: RP_ORIGIN,
        },
        context: {
          apiKeyId: undefined,
        },
      });

      authenticationVerification = await verifyAuthenticationResponse({
        response: PublicKeyCredentialDtoSchema.encode(
          publicKeyCredential,
        ) as AuthenticationResponseJSON,
        expectedChallenge: CHALLENGE_BASE64URL,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: credentialID,
          publicKey,
          counter: secondCounter,
        },
        requireUserVerification: true,
      });

      expect(authenticationVerification.verified).toBe(true);
      const thirdCounter =
        authenticationVerification.authenticationInfo.newCounter;
      expect(thirdCounter).toBeGreaterThan(secondCounter);
    });
  });

  /**
   * Tests for meta.userId validation
   * @see https://www.w3.org/TR/webauthn-3/#user-handle
   *
   * Per spec: The user handle is the identifier for the user account
   */
  describe('meta.userId', () => {
    test('should throw error when userId is invalid UUID', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      await expect(async () =>
        authenticator.getCredential({
          publicKeyCredentialRequestOptions: requestOptions,
          meta: {
            userId: 'INVALID_USER_ID',
            origin: RP_ORIGIN,
          },
          context: {
            apiKeyId: undefined,
          },
        }),
      ).rejects.toThrowError();
    });

    test('should throw error when userId is null', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      await expect(async () =>
        authenticator.getCredential({
          publicKeyCredentialRequestOptions: requestOptions,
          meta: {
            userId: null as unknown as string,
            origin: RP_ORIGIN,
          },
          context: {
            apiKeyId: undefined,
          },
        }),
      ).rejects.toThrowError();
    });

    test('should throw error when userId is empty string', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      await expect(async () =>
        authenticator.getCredential({
          publicKeyCredentialRequestOptions: requestOptions,
          meta: {
            userId: '',
            origin: RP_ORIGIN,
          },
          context: {
            apiKeyId: undefined,
          },
        }),
      ).rejects.toThrowError();
    });
  });

  /**
   * Tests for origin validation
   * @see https://www.w3.org/TR/webauthn-3/#dom-collectedclientdata-origin
   *
   * Per spec: The origin must match the RP ID for security
   */
  describe('meta.origin', () => {
    test('should work with valid origin matching RP ID', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

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
          id: credentialID,
          publicKey,
          counter,
        },
        requireUserVerification: true,
      });

      expect(authenticationVerification.verified).toBe(true);
    });

    test('should fail verification with mismatched origin', async () => {
      const requestOptions = createPublicKeyCredentialRequestOptions({
        credentialID: credentialRawID,
      });

      const wrongOrigin = 'https://evil.com';

      const publicKeyCredential = await authenticator.getCredential({
        publicKeyCredentialRequestOptions: requestOptions,
        meta: {
          userId: USER_ID,
          origin: wrongOrigin,
        },
        context: {
          apiKeyId: undefined,
        },
      });

      // The credential is created, but verification should fail due to origin mismatch
      await expect(async () =>
        verifyAuthenticationResponse({
          response: PublicKeyCredentialDtoSchema.encode(
            publicKeyCredential,
          ) as AuthenticationResponseJSON,
          expectedChallenge: CHALLENGE_BASE64URL,
          expectedOrigin: RP_ORIGIN, // Expecting correct origin
          expectedRPID: RP_ID,
          credential: {
            id: credentialID,
            publicKey,
            counter,
          },
          requireUserVerification: true,
        }),
      ).rejects.toThrowError();
    });
  });
});
