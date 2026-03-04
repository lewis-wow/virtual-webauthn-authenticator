import {
  upsertTestingUser,
  USER_ID,
  USER_NAME,
} from '../../../../auth/__tests__/helpers';

import { TypeAssertionError } from '@repo/assert';
import { Jwks, Jwt } from '@repo/crypto';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import { PrismaClient } from '@repo/prisma';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import { VirtualAuthenticator } from '../../../src/authenticator/VirtualAuthenticator';
import { InvalidUserVerificationPin } from '../../../src/authenticator/exceptions/InvalidUserVerificationPin';
import { VirtualAuthenticatorAgent } from '../../../src/authenticatorAgent/VirtualAuthenticatorAgent';
import { UserPresenceRequiredAgentException } from '../../../src/authenticatorAgent/exceptions/UserPresenceRequiredAgentException';
import { CredPropsExtension } from '../../../src/authenticatorAgent/extensions/CredPropsExtension';
import { ExtensionProcessor } from '../../../src/authenticatorAgent/extensions/ExtensionProcessor';
import { ExtensionRegistry } from '../../../src/authenticatorAgent/extensions/ExtensionRegistry';
import { PublicKeyCredentialType } from '../../../src/enums/PublicKeyCredentialType';
import { UserVerification } from '../../../src/enums/UserVerification';
import { VirtualAuthenticatorUserVerificationType } from '../../../src/enums/VirtualAuthenticatorUserVerificationType';
import { PrismaVirtualAuthenticatorRepository } from '../../../src/repositories/PrismaVirtualAuthenticatorRepository';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import { StateManager } from '../../../src/state/StateManager';
import type { PublicKeyCredentialCreationOptions } from '../../../src/validation/spec/PublicKeyCredentialCreationOptionsSchema';
import type { PublicKeyCredentialRequestOptions } from '../../../src/validation/spec/PublicKeyCredentialRequestOptionsSchema';
import { InMemoryJwksRepository } from '../../helpers/InMemoryJwksRepository';
import { KeyVaultKeyIdGenerator } from '../../helpers/KeyVaultKeyIdGenerator';
import { MockKeyProvider } from '../../helpers/MockKeyProvider';
import {
  CHALLENGE_BYTES,
  RP_ID,
  RP_NAME,
  RP_ORIGIN,
  TEST_PIN,
  USER_DISPLAY_NAME,
  USER_ID_BYTSES,
} from '../../helpers/consts';
import { unreachable } from '../../helpers/unreachable';
import { performPublicKeyCredentialRegistrationAndVerify } from './performPublicKeyCredentialRegistrationAndVerify';
import { performPublicKeyCredentialRequestAndVerify } from './performPublicKeyCredentialRequestAndVerify';

const PIN_AUTHENTICATOR_ID = '00000000-0000-0000-0000-000000000010';
const NONE_AUTHENTICATOR_ID = '00000000-0000-0000-0000-000000000011';
const WRONG_PIN = '9999';

const PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS = {
  rp: {
    name: RP_NAME,
    id: RP_ID,
  },
  user: {
    id: USER_ID_BYTSES,
    name: USER_NAME,
    displayName: USER_DISPLAY_NAME,
  },
  challenge: CHALLENGE_BYTES,
  pubKeyCredParams: [
    { type: PublicKeyCredentialType.PUBLIC_KEY, alg: COSEKeyAlgorithm.ES256 },
  ],
  timeout: 60000,
  authenticatorSelection: {
    userVerification: UserVerification.REQUIRED,
  },
} as PublicKeyCredentialCreationOptions;

const PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS = {
  challenge: CHALLENGE_BYTES,
  rpId: RP_ID,
  timeout: 60000,
  userVerification: UserVerification.REQUIRED,
  allowCredentials: [],
} as PublicKeyCredentialRequestOptions;

/**
 * Integration tests for User Verification PIN flow.
 *
 * These tests validate the PIN-based user verification mechanism, including:
 * - Registration and authentication with valid PIN
 * - Rejection of invalid/missing PINs for PIN-type authenticators
 * - UV without PIN for NONE-type authenticators
 * - Full multi-step state flows (UP → UV with PIN)
 */
describe('User Verification PIN', () => {
  const prisma = new PrismaClient();
  const keyVaultKeyIdGenerator = new KeyVaultKeyIdGenerator();
  const keyProvider = new MockKeyProvider({ keyVaultKeyIdGenerator });
  const webAuthnRepository = new PrismaWebAuthnRepository({ prisma });
  const virtualAuthenticatorRepository =
    new PrismaVirtualAuthenticatorRepository({ prisma });
  const authenticator = new VirtualAuthenticator({
    webAuthnRepository,
    virtualAuthenticatorRepository,
    keyProvider,
  });
  const extensionRegistry = new ExtensionRegistry().registerAll([
    new CredPropsExtension(),
  ]);
  const extensionProcessor = new ExtensionProcessor(extensionRegistry);
  const jwksRepository = new InMemoryJwksRepository();
  const jwks = new Jwks({
    encryptionKey: 'test-encryption-key',
    jwksRepository,
  });
  const jwt = new Jwt({ jwks });
  const stateManager = new StateManager({ jwt });

  const agent = new VirtualAuthenticatorAgent({
    authenticator,
    extensionProcessor,
    stateManager,
  });

  const cleanupWebAuthnPublicKeyCredentials = async () => {
    await prisma.$transaction([
      prisma.webAuthnPublicKeyCredential.deleteMany(),
      prisma.webAuthnPublicKeyCredentialKeyVaultKeyMeta.deleteMany(),
    ]);
  };

  const pinMeta = {
    virtualAuthenticatorId: PIN_AUTHENTICATOR_ID,
  };

  const noneMeta = {
    virtualAuthenticatorId: NONE_AUTHENTICATOR_ID,
  };

  beforeAll(async () => {
    await upsertTestingUser({ prisma });

    // Create a PIN-type virtual authenticator with a known PIN
    await prisma.virtualAuthenticator.upsert({
      where: { id: PIN_AUTHENTICATOR_ID },
      update: {},
      create: {
        id: PIN_AUTHENTICATOR_ID,
        userId: USER_ID,
        userVerificationType: VirtualAuthenticatorUserVerificationType.PIN,
        pin: TEST_PIN,
      },
    });

    // Create a NONE-type virtual authenticator (no PIN required)
    await prisma.virtualAuthenticator.upsert({
      where: { id: NONE_AUTHENTICATOR_ID },
      update: {},
      create: {
        id: NONE_AUTHENTICATOR_ID,
        userId: USER_ID,
        userVerificationType: 'NONE',
      },
    });
  });

  afterEach(async () => {
    await cleanupWebAuthnPublicKeyCredentials();
  });

  afterAll(async () => {
    await prisma.virtualAuthenticator.deleteMany({
      where: {
        id: { in: [PIN_AUTHENTICATOR_ID, NONE_AUTHENTICATOR_ID] },
      },
    });
    await prisma.user.deleteMany();
  });

  describe('Registration (createCredential)', () => {
    describe('PIN-type authenticator', () => {
      test('Should succeed with correct PIN', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: pinMeta,
            uvState: { pin: TEST_PIN },
          });

        expect(publicKeyCredential).toBeDefined();
        expect(publicKeyCredential.id).toBeDefined();
        expect(publicKeyCredential.type).toBe(
          PublicKeyCredentialType.PUBLIC_KEY,
        );
      });

      test('Should throw InvalidUserVerificationPin with incorrect PIN', async () => {
        await expect(
          performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: pinMeta,
            uvState: { pin: WRONG_PIN },
          }),
        ).rejects.toThrow(InvalidUserVerificationPin);
      });

      test('Should throw TypeAssertionError when PIN is empty string', async () => {
        await expect(
          performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: pinMeta,
            uvState: { pin: '' },
          }),
        ).rejects.toThrow(TypeAssertionError);
      });

      test('Should throw TypeAssertionError when PIN is not provided', async () => {
        await expect(
          performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: pinMeta,
            uvState: {},
          }),
        ).rejects.toThrow(TypeAssertionError);
      });
    });

    describe('NONE-type authenticator', () => {
      test('Should succeed without PIN', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: noneMeta,
          });

        expect(publicKeyCredential).toBeDefined();
        expect(publicKeyCredential.id).toBeDefined();
        expect(publicKeyCredential.type).toBe(
          PublicKeyCredentialType.PUBLIC_KEY,
        );
      });

      test('Should succeed even when a PIN is provided (ignored)', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: noneMeta,
            uvState: { pin: 'any-pin' },
          });

        expect(publicKeyCredential).toBeDefined();
        expect(publicKeyCredential.id).toBeDefined();
      });
    });
  });

  describe('Authentication (getAssertion)', () => {
    describe('PIN-type authenticator', () => {
      test('Should succeed with correct PIN', async () => {
        // First register a credential
        const { webAuthnCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: pinMeta,
            uvState: { pin: TEST_PIN },
          });

        // Then authenticate
        const { publicKeyCredential } =
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions:
              PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
            webAuthnCredential,
            meta: pinMeta,
            uvState: { pin: TEST_PIN },
          });

        expect(publicKeyCredential).toBeDefined();
        expect(publicKeyCredential.id).toBeDefined();
        expect(publicKeyCredential.type).toBe(
          PublicKeyCredentialType.PUBLIC_KEY,
        );
      });

      test('Should throw InvalidUserVerificationPin with incorrect PIN', async () => {
        const { webAuthnCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: pinMeta,
            uvState: { pin: TEST_PIN },
          });

        await expect(
          performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions:
              PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
            webAuthnCredential,
            meta: pinMeta,
            uvState: { pin: WRONG_PIN },
          }),
        ).rejects.toThrow(InvalidUserVerificationPin);
      });

      test('Should throw TypeAssertionError when PIN is empty string', async () => {
        const { webAuthnCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: pinMeta,
            uvState: { pin: TEST_PIN },
          });

        await expect(
          performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions:
              PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
            webAuthnCredential,
            meta: pinMeta,
            uvState: { pin: '' },
          }),
        ).rejects.toThrow(TypeAssertionError);
      });

      test('Should throw TypeAssertionError when PIN is not provided', async () => {
        const { webAuthnCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: pinMeta,
            uvState: { pin: TEST_PIN },
          });

        await expect(
          performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions:
              PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
            webAuthnCredential,
            meta: pinMeta,
            uvState: {},
          }),
        ).rejects.toThrow(TypeAssertionError);
      });
    });

    describe('NONE-type authenticator', () => {
      test('Should succeed without PIN', async () => {
        const { webAuthnCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            stateManager,
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: noneMeta,
          });

        const { publicKeyCredential } =
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions:
              PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
            webAuthnCredential,
            meta: noneMeta,
          });

        expect(publicKeyCredential).toBeDefined();
        expect(publicKeyCredential.id).toBeDefined();
        expect(publicKeyCredential.type).toBe(
          PublicKeyCredentialType.PUBLIC_KEY,
        );
      });
    });
  });

  describe('Batch state (up and uv with PIN in one step)', () => {
    test('Should succeed with correct PIN in a single batch', async () => {
      // First call — throws UserPresenceRequiredAgentException
      let stateToken: string;
      try {
        await agent.createCredential({
          origin: RP_ORIGIN,
          options: { publicKey: PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS },
          sameOriginWithAncestors: true,
          meta: {
            userId: USER_ID,
            virtualAuthenticatorId: PIN_AUTHENTICATOR_ID,
            apiKeyId: null,
            origin: RP_ORIGIN,
            userPresenceEnabled: true,
            userVerificationEnabled: true,
          },
        });

        expect.unreachable(unreachable(UserPresenceRequiredAgentException));
      } catch (error) {
        expect(error).toBeInstanceOf(UserPresenceRequiredAgentException);
        stateToken = (error as UserPresenceRequiredAgentException).data
          .stateToken;
      }

      // Second call — provide UP and UV with correct PIN in one step
      const credential = await agent.createCredential({
        origin: RP_ORIGIN,
        options: { publicKey: PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS },
        sameOriginWithAncestors: true,
        meta: {
          userId: USER_ID,
          virtualAuthenticatorId: PIN_AUTHENTICATOR_ID,
          apiKeyId: null,
          origin: RP_ORIGIN,
          userPresenceEnabled: true,
          userVerificationEnabled: true,
        },
        prevStateToken: stateToken!,
        nextState: { up: true, uv: { pin: TEST_PIN } },
      });

      expect(credential).toBeDefined();
    });

    test('Should throw InvalidUserVerificationPin with wrong PIN in batch', async () => {
      let stateToken: string;
      try {
        await agent.createCredential({
          origin: RP_ORIGIN,
          options: { publicKey: PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS },
          sameOriginWithAncestors: true,
          meta: {
            userId: USER_ID,
            virtualAuthenticatorId: PIN_AUTHENTICATOR_ID,
            apiKeyId: null,
            origin: RP_ORIGIN,
            userPresenceEnabled: true,
            userVerificationEnabled: true,
          },
        });

        expect.unreachable(unreachable(UserPresenceRequiredAgentException));
      } catch (error) {
        expect(error).toBeInstanceOf(UserPresenceRequiredAgentException);
        stateToken = (error as UserPresenceRequiredAgentException).data
          .stateToken;
      }

      await expect(
        agent.createCredential({
          origin: RP_ORIGIN,
          options: { publicKey: PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS },
          sameOriginWithAncestors: true,
          meta: {
            userId: USER_ID,
            virtualAuthenticatorId: PIN_AUTHENTICATOR_ID,
            apiKeyId: null,
            origin: RP_ORIGIN,
            userPresenceEnabled: true,
            userVerificationEnabled: true,
          },
          prevStateToken: stateToken!,
          nextState: { up: true, uv: { pin: WRONG_PIN } },
        }),
      ).rejects.toThrow(InvalidUserVerificationPin);
    });
  });

  describe('PrismaVirtualAuthenticatorRepository.validatePin()', () => {
    test('Should return true for correct PIN', async () => {
      const result = await virtualAuthenticatorRepository.validatePin({
        virtualAuthenticatorId: PIN_AUTHENTICATOR_ID,
        userId: USER_ID,
        pin: TEST_PIN,
      });

      expect(result).toBe(true);
    });

    test('Should throw InvalidUserVerificationPin for incorrect PIN', async () => {
      await expect(
        virtualAuthenticatorRepository.validatePin({
          virtualAuthenticatorId: PIN_AUTHENTICATOR_ID,
          userId: USER_ID,
          pin: WRONG_PIN,
        }),
      ).rejects.toThrow(InvalidUserVerificationPin);
    });

    test('Should throw TypeAssertionError for empty PIN on PIN-type authenticator', async () => {
      await expect(
        virtualAuthenticatorRepository.validatePin({
          virtualAuthenticatorId: PIN_AUTHENTICATOR_ID,
          userId: USER_ID,
          pin: '',
        }),
      ).rejects.toThrow(TypeAssertionError);
    });

    test('Should return true for NONE-type authenticator without PIN', async () => {
      const result = await virtualAuthenticatorRepository.validatePin({
        virtualAuthenticatorId: NONE_AUTHENTICATOR_ID,
        userId: USER_ID,
        pin: '',
      });

      expect(result).toBe(true);
    });

    test('Should throw InvalidUserVerificationPin for non-existent authenticator', async () => {
      await expect(
        virtualAuthenticatorRepository.validatePin({
          virtualAuthenticatorId: '00000000-0000-0000-0000-999999999999',
          userId: USER_ID,
          pin: TEST_PIN,
        }),
      ).rejects.toThrow(InvalidUserVerificationPin);
    });

    test('Should throw InvalidUserVerificationPin for wrong userId', async () => {
      await expect(
        virtualAuthenticatorRepository.validatePin({
          virtualAuthenticatorId: PIN_AUTHENTICATOR_ID,
          userId: '00000000-0000-0000-0000-999999999999',
          pin: TEST_PIN,
        }),
      ).rejects.toThrow(InvalidUserVerificationPin);
    });
  });
});
