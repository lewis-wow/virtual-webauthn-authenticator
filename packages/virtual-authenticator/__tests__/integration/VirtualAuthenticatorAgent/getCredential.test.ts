import { upsertTestingUser, USER_ID } from '../../../../auth/__tests__/helpers';
import { set } from '@repo/core/__tests__/helpers';

import { TypeAssertionError } from '@repo/assert';
import { UUIDMapper } from '@repo/core/mappers';
import { Hash, HashOnion, Jwks, Jwt } from '@repo/crypto';
import { PrismaClient } from '@repo/prisma';
import type { Uint8Array_ } from '@repo/types';
import { type WebAuthnCredential } from '@simplewebauthn/server';
import { randomBytes } from 'node:crypto';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { ZodError } from 'zod';

import { VirtualAuthenticatorAgent } from '../../../src/agent/VirtualAuthenticatorAgent';
import { CredentialSelectAgentException } from '../../../src/agent/exceptions/CredentialSelectAgentException';
import {
  CredPropsExtension,
  ExtensionProcessor,
  ExtensionRegistry,
} from '../../../src/agent/extensions';
import { VirtualAuthenticator } from '../../../src/authenticator/VirtualAuthenticator';
import { CredentialSelectException } from '../../../src/authenticator/exceptions/CredentialSelectException';
import { AuthenticatorGetAssertionArgsDtoSchema } from '../../../src/dto/authenticator/AuthenticatorGetAssertionArgsDtoSchema';
import { PublicKeyCredentialRequestOptionsDtoSchema } from '../../../src/dto/spec/PublicKeyCredentialRequestOptionsDtoSchema';
import { PublicKeyCredentialType } from '../../../src/enums/PublicKeyCredentialType';
import { UserVerification } from '../../../src/enums/UserVerification';
import { CredentialNotFound } from '../../../src/exceptions/CredentialNotFound';
import { CredentialOptionsEmpty } from '../../../src/exceptions/CredentialOptionsEmpty';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import { StateManager } from '../../../src/state/StateManager';
import { type AuthenticatorGetAssertionArgs } from '../../../src/validation';
import type { AuthenticatorMetaArgs } from '../../../src/validation/authenticator/AuthenticatorMetaArgsSchema';
import type { AuthenticatorAgentMetaArgs } from '../../../src/validation/authenticatorAgent/AuthenticatorAgentMetaArgsSchema';
import type { PublicKeyCredentialRequestOptions } from '../../../src/validation/spec/PublicKeyCredentialRequestOptionsSchema';
import type { PublicKeyCredential } from '../../../src/validation/spec/PublicKeyCredentialSchema';
import { InMemoryJwksRepository } from '../../helpers/InMemoryJwksRepository';
import { KeyVaultKeyIdGenerator } from '../../helpers/KeyVaultKeyIdGenerator';
import { MockKeyProvider } from '../../helpers/MockKeyProvider';
import {
  CHALLENGE_BYTES,
  PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
  RP_ID,
  RP_ORIGIN,
} from '../../helpers/consts';
import { generateRandomUUIDBytes } from '../../helpers/generateRandomUUIDBytes';
import { AUTHENTICATOR_GET_ASSERTION_ARGS } from '../VirtualAuthenticator/performAuthenticatorGetAssertionAndVerify';
import { performPublicKeyCredentialRegistrationAndVerify } from './performPublicKeyCredentialRegistrationAndVerify';
import { performPublicKeyCredentialRequestAndVerify } from './performPublicKeyCredentialRequestAndVerify';

const PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS = {
  challenge: CHALLENGE_BYTES,
  rpId: RP_ID,
} as PublicKeyCredentialRequestOptions;

/**
 * Tests for VirtualAuthenticator.getCredential() method
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
 * @see https://www.w3.org/TR/webauthn-3/#authenticatorgetassertion
 *
 * Per spec: The authenticatorGetAssertion operation is used to produce an assertion
 * signature representing a user's authentication. This is part of the WebAuthn
 * authentication ceremony.
 */
describe('VirtualAuthenticator.getCredential()', () => {
  const prisma = new PrismaClient();
  const keyVaultKeyIdGenerator = new KeyVaultKeyIdGenerator();
  const keyProvider = new MockKeyProvider({ keyVaultKeyIdGenerator });
  const webAuthnPublicKeyCredentialRepository = new PrismaWebAuthnRepository({
    prisma,
  });
  const authenticator = new VirtualAuthenticator({
    webAuthnRepository: webAuthnPublicKeyCredentialRepository,
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

  let webAuthnCredential: WebAuthnCredential;
  let publicKeyCredential: PublicKeyCredential;

  beforeAll(async () => {
    await upsertTestingUser({ prisma });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await cleanupWebAuthnPublicKeyCredentials();
  });

  afterEach(async () => {
    // Clean up credentials after each test to ensure a fresh state for the next test
    await cleanupWebAuthnPublicKeyCredentials();
  });

  beforeEach(async () => {
    const performPublicKeyCredentialRegistrationAndVerifyResponse =
      await performPublicKeyCredentialRegistrationAndVerify({
        stateManager,
        agent,
        publicKeyCredentialCreationOptions:
          PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
      });

    webAuthnCredential =
      performPublicKeyCredentialRegistrationAndVerifyResponse.webAuthnCredential;
    publicKeyCredential =
      performPublicKeyCredentialRegistrationAndVerifyResponse.publicKeyCredential;
  });

  /**
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
   * Per spec: The authenticator should produce a valid assertion that can be verified
   */
  test('should produce a verifiable assertion', async () => {
    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: publicKeyCredential.rawId,
          },
        ],
      },
    );

    await performPublicKeyCredentialRequestAndVerify({
      stateManager,
      agent,
      publicKeyCredentialRequestOptions,
      webAuthnCredential,
    });
  });

  /**
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-allowcredentials
   * Per spec: If allowCredentials is undefined or empty, the authenticator should
   * use discoverable credentials associated with the RP ID
   */
  test('should produce a verifiable assertion without allowCredentials', async () => {
    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        allowCredentials: undefined,
      },
    );

    await performPublicKeyCredentialRequestAndVerify({
      stateManager,
      agent,
      publicKeyCredentialRequestOptions,
      webAuthnCredential,
    });
  });

  /**
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-allowcredentials
   * Per spec: The authenticator should find the matching credential even when
   * allowCredentials contains additional non-matching credential IDs
   */
  test('should produce a verifiable assertion with redundant allowCredentials', async () => {
    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        allowCredentials: [
          { id: generateRandomUUIDBytes(), type: 'public-key' },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: publicKeyCredential.rawId,
          },
        ],
      },
    );

    await performPublicKeyCredentialRequestAndVerify({
      stateManager,
      agent,
      publicKeyCredentialRequestOptions,
      webAuthnCredential,
    });
  });

  /**
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-rpid
   * @see https://www.w3.org/TR/webauthn-3/#relying-party-identifier
   * Per spec: The RP ID must match the credential's RP ID for authentication to succeed
   */
  test('should fail when RP ID differ from Origin', async () => {
    const rpId = 'different-example.com';

    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        rpId,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: publicKeyCredential.rawId,
          },
        ],
      },
    );

    await expect(
      async () =>
        await performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        }),
    ).to.rejects.toThrowError(new TypeAssertionError());
  });

  test('should fail with different user ID', async () => {
    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: publicKeyCredential.rawId,
          },
        ],
      },
    );

    const meta: Partial<AuthenticatorAgentMetaArgs> = {
      userId: 'INVALID_USER_ID',
    };

    await expect(() =>
      performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
        meta,
      }),
    ).rejects.toThrowError(new CredentialOptionsEmpty());
  });

  test('should fail with wrong allowCredentials', async () => {
    const wrongCredentialId = generateRandomUUIDBytes();
    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        allowCredentials: [
          { id: wrongCredentialId, type: PublicKeyCredentialType.PUBLIC_KEY },
        ],
      },
    );

    await expect(
      async () =>
        await performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        }),
    ).to.rejects.toThrowError(new CredentialNotFound());
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
    test.each([
      {
        userVerification: undefined,
      },
      {
        userVerification: UserVerification.REQUIRED,
      },
      {
        userVerification: UserVerification.PREFERRED,
      },
      {
        userVerification: UserVerification.DISCOURAGED,
      },
    ])(
      'With userVerification $userVerification',
      async ({ userVerification }) => {
        const publicKeyCredentialRequestOptions = set(
          PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
          {
            allowCredentials: [
              {
                type: PublicKeyCredentialType.PUBLIC_KEY,
                id: publicKeyCredential.rawId,
              },
            ],
            userVerification,
          },
        );

        await performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        });
      },
    );

    test('should throw type mismatch when userVerification is not in enum', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          userVerification: 'INVALID_USER_VERIFICATION' as UserVerification,
        },
      ) as unknown as PublicKeyCredentialRequestOptions;

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        }),
      ).rejects.toThrowError();
    });
  });

  /**
   * Step 10: Tests for authenticatorData flags (UP and UV bits)
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion (step 10)
   * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data
   *
   * Per spec: authenticatorData must include correct flags for User Present (UP) and User Verified (UV)
   * Bit 0 (UP): User Present - set when user presence test succeeds
   * Bit 2 (UV): User Verified - set when user verification succeeds
   */
  describe('Step 10: AuthenticatorData Flags', () => {
    test('should set UV flag when userVerification is required', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          userVerification: UserVerification.REQUIRED,
        },
      );

      const { parsedAuthenticatorData } =
        await performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        });

      // Per spec: UV flag (bit 2) must be set when userVerification is required
      expect(parsedAuthenticatorData.flags.uv).toBe(true);
    });

    test('should set UP flag for all assertions', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          userVerification: UserVerification.DISCOURAGED,
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    test('should not set AT flag in assertion (only in registration)', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
        },
      );

      const { parsedAuthenticatorData } =
        await performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        });

      // Per spec: AT flag (bit 6) should NOT be set in assertion authenticatorData
      // (attested credential data is only included during registration)
      expect(parsedAuthenticatorData.flags.at).toBe(false);
      // The authenticatorData should not contain attested credential data
    });
  });

  /**
   * Tests for timeout parameter
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-timeout
   *
   * Per spec: This OPTIONAL member specifies a time, in milliseconds, that the Relying Party
   * is willing to wait for the call to complete. The value is treated as a hint, and MAY be
   * overridden by the client.
   */
  describe('PublicKeyCredentialRequestOptions.timeout', () => {
    test.each([
      { timeout: undefined },
      { timeout: 30000 },
      { timeout: 60000 },
      { timeout: 120000 },
      { timeout: 300000 },
    ])('should work with timeout $timeout', async ({ timeout }) => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          timeout,
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });
  });

  /**
   * Tests for allowCredentials parameter variations
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-allowcredentials
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialdescriptor
   *
   * Per spec: This OPTIONAL member contains a list of PublicKeyCredentialDescriptor objects
   * representing public key credentials acceptable to the caller, in descending order of
   * preference. If empty, the authenticator should use discoverable credentials.
   */
  describe('PublicKeyCredentialRequestOptions.allowCredentials variations', () => {
    test('should work with allowCredentials as empty array', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [],
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    test('should work with multiple allowCredentials including the correct one', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              id: generateRandomUUIDBytes(),
              type: PublicKeyCredentialType.PUBLIC_KEY,
            },
            {
              id: generateRandomUUIDBytes(),
              type: PublicKeyCredentialType.PUBLIC_KEY,
            },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
            {
              id: generateRandomUUIDBytes(),
              type: PublicKeyCredentialType.PUBLIC_KEY,
            },
          ],
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });
  });

  /**
   * Tests for rpId parameter
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-rpid
   * @see https://www.w3.org/TR/webauthn-3/#relying-party-identifier
   *
   * Per spec: This OPTIONAL member specifies the RP ID claimed by the Relying Party.
   * If omitted, its value will be the CredentialsContainer object's relevant settings object's
   * origin's effective domain.
   */
  describe('PublicKeyCredentialRequestOptions.rpId', () => {
    test('should work with explicit rpId matching the origin', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          rpId: RP_ID,
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    test('should throw type mismatch when rpId is not a string', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          rpId: 12345 as unknown as string,
        },
      ) as unknown as PublicKeyCredentialRequestOptions;

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnCredential,
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
      const challenge = new Uint8Array(randomBytes(16));

      const publicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: publicKeyCredential.rawId,
          },
        ],
      };

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    test('should fail with challenge less than 16 bytes (spec recommends at least 16)', async () => {
      const challenge = new Uint8Array(randomBytes(15));

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          challenge,
        },
      );

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnCredential,
          }),
      ).rejects.toThrowError();
    });

    test('should fail with empty challenge (0 bytes)', async () => {
      const challenge = new Uint8Array(0);

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          challenge,
        },
      );

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        }),
      ).rejects.toThrowError();
    });

    test('should work with very large challenge (1024 bytes)', async () => {
      const challenge = new Uint8Array(randomBytes(1024));

      const publicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: publicKeyCredential.rawId,
          },
        ],
      };

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    test('should fail when challenge is not Uint8Array', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          challenge: 'not-a-uint8array' as unknown as Uint8Array_,
        },
      ) as unknown as PublicKeyCredentialRequestOptions;

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        }),
      ).rejects.toThrowError();
    });

    /**
     * Step 11: Test signature creation with various challenge sizes
     * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion (step 11)
     *
     * Per spec: Signature is created from concatenation of authenticatorData || hash
     * This tests that signature verification works correctly with different challenge sizes
     */
    test('should create valid signature with minimum challenge size (16 bytes)', async () => {
      const minChallenge = new Uint8Array(randomBytes(16));

      const publicKeyCredentialRequestOptions = {
        challenge: minChallenge,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: publicKeyCredential.rawId,
          },
        ],
      };

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    test('should create valid signature with large challenge size (512 bytes)', async () => {
      const largeChallenge = new Uint8Array(randomBytes(512));

      const publicKeyCredentialRequestOptions = {
        challenge: largeChallenge,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: publicKeyCredential.rawId,
          },
        ],
      };

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
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
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          extensions: undefined,
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    test('should work with empty extensions object', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          extensions: {},
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-appid-extension
     * Per spec: appid extension allows authentication with credentials registered with FIDO U2F
     * Note: This extension is not implemented - result should be undefined
     */
    describe('appid extension (not implemented)', () => {
      test('should work with appid extension and return undefined result', async () => {
        const publicKeyCredentialRequestOptions = set(
          PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
          {
            allowCredentials: [
              {
                type: PublicKeyCredentialType.PUBLIC_KEY,
                id: publicKeyCredential.rawId,
              },
            ],
            extensions: {
              appid: 'https://example.com/appid.json',
            },
          },
        );

        const { publicKeyCredential: resultCredential } =
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnCredential,
          });

        // Extension not implemented - result should be undefined
        expect(
          (resultCredential.clientExtensionResults as Record<string, unknown>)[
            'appid'
          ],
        ).toBeUndefined();
      });
    });

    /**
     * @see https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-errata-20220621.html#sctn-hmac-secret-extension
     * Per CTAP2: hmac-secret extension for symmetric secret operations
     * Note: This extension is not implemented - result should be undefined
     */
    describe('hmac-secret extension (not implemented)', () => {
      test('should work with hmac-secret extension and return undefined result', async () => {
        const publicKeyCredentialRequestOptions = set(
          PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
          {
            allowCredentials: [
              {
                type: PublicKeyCredentialType.PUBLIC_KEY,
                id: publicKeyCredential.rawId,
              },
            ],
            extensions: {
              'hmac-secret': {
                salt1: new Uint8Array(32),
                salt2: new Uint8Array(32),
              },
            },
          },
        );

        const { publicKeyCredential: resultCredential } =
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnCredential,
          });

        // Extension not implemented - result should be undefined
        expect(
          (resultCredential.clientExtensionResults as Record<string, unknown>)[
            'hmac-secret'
          ],
        ).toBeUndefined();
      });
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-large-blob-extension
     * Per spec: largeBlob extension for reading/writing large blob data
     * Note: This extension is not implemented - result should be undefined
     */
    describe('largeBlob extension (not implemented)', () => {
      test('should work with largeBlob extension (read) and return undefined result', async () => {
        const publicKeyCredentialRequestOptions = set(
          PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
          {
            allowCredentials: [
              {
                type: PublicKeyCredentialType.PUBLIC_KEY,
                id: publicKeyCredential.rawId,
              },
            ],
            extensions: {
              largeBlob: {
                read: true,
              },
            },
          },
        );

        const { publicKeyCredential: resultCredential } =
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnCredential,
          });

        // Extension not implemented - result should be undefined
        expect(
          (resultCredential.clientExtensionResults as Record<string, unknown>)[
            'largeBlob'
          ],
        ).toBeUndefined();
      });

      test('should work with largeBlob extension (write) and return undefined result', async () => {
        const publicKeyCredentialRequestOptions = set(
          PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
          {
            allowCredentials: [
              {
                type: PublicKeyCredentialType.PUBLIC_KEY,
                id: publicKeyCredential.rawId,
              },
            ],
            extensions: {
              largeBlob: {
                write: new Uint8Array([1, 2, 3, 4, 5]),
              },
            },
          },
        );

        const { publicKeyCredential: resultCredential } =
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnCredential,
          });

        // Extension not implemented - result should be undefined
        expect(
          (resultCredential.clientExtensionResults as Record<string, unknown>)[
            'largeBlob'
          ],
        ).toBeUndefined();
      });
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-extensions
     * Per spec: "Authenticators MUST ignore any extensions that they do not recognize."
     */
    describe('Unknown extensions', () => {
      test('should ignore unknown/unsupported extensions and return undefined results', async () => {
        const publicKeyCredentialRequestOptions = set(
          PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
          {
            allowCredentials: [
              {
                type: PublicKeyCredentialType.PUBLIC_KEY,
                id: publicKeyCredential.rawId,
              },
            ],
            extensions: {
              unknownExtension: 'some-value',
              anotherUnknown: { complex: 'object' },
            },
          },
        );

        const { publicKeyCredential: resultCredential } =
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnCredential,
          });

        // Unknown extensions should not appear in the results
        expect(
          (resultCredential.clientExtensionResults as Record<string, unknown>)[
            'unknownExtension'
          ],
        ).toBeUndefined();
        expect(
          (resultCredential.clientExtensionResults as Record<string, unknown>)[
            'anotherUnknown'
          ],
        ).toBeUndefined();
      });
    });

    describe('Multiple extensions combined', () => {
      test('should work with multiple extensions and return undefined results for all unimplemented', async () => {
        const publicKeyCredentialRequestOptions = set(
          PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
          {
            allowCredentials: [
              {
                type: PublicKeyCredentialType.PUBLIC_KEY,
                id: publicKeyCredential.rawId,
              },
            ],
            extensions: {
              appid: 'https://example.com/appid.json',
              largeBlob: {
                read: true,
              },
              unknownExtension: 'ignored',
            },
          },
        );

        const { publicKeyCredential: resultCredential } =
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnCredential,
          });

        // All extensions not implemented - results should be undefined
        expect(
          (resultCredential.clientExtensionResults as Record<string, unknown>)[
            'appid'
          ],
        ).toBeUndefined();
        expect(
          (resultCredential.clientExtensionResults as Record<string, unknown>)[
            'largeBlob'
          ],
        ).toBeUndefined();
        expect(
          (resultCredential.clientExtensionResults as Record<string, unknown>)[
            'unknownExtension'
          ],
        ).toBeUndefined();
      });
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
      const challenge = new Uint8Array(randomBytes(32));

      // Only required field per spec is challenge
      const publicKeyCredentialRequestOptions = {
        challenge,
      };

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    /**
     * Step 3: Tests for allowCredentialDescriptorList credential lookup
     * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion (step 3)
     *
     * The malformed credential IDs are simply ommited.
     */
    test('Should work with malformed credential IDs in allowCredentials', async () => {
      // Malformed ID that is not a valid UUID will cause an error
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: new Uint8Array([1, 2, 3]), // Malformed - not a valid UUID
            },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId, // Valid credential
            },
          ],
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    /**
     * Step 3: Test that allowCredentials filters correctly with non-matching IDs
     * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion (step 3)
     */
    test('Should fail when allowCredentials contains only non-matching credential IDs', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: UUIDMapper.UUIDtoBytes(
                '00000000-0000-0000-0000-000000000000',
              ),
            },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: generateRandomUUIDBytes(),
            },
          ],
        },
      );

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        }),
      ).rejects.toThrowError(new CredentialNotFound());
    });

    test('should work with all fields at maximum complexity', async () => {
      const largeChallenge = new Uint8Array(randomBytes(1024));

      const publicKeyCredentialRequestOptions = {
        challenge: largeChallenge,
        rpId: RP_ID,
        timeout: 300000,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: generateRandomUUIDBytes(),
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: generateRandomUUIDBytes(),
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: publicKeyCredential.rawId,
          },
        ],
        userVerification: UserVerification.REQUIRED,
        extensions: {
          appid: 'https://example.com/appid.json',
          largeBlob: {
            read: true,
          },
          unknownExtension: 'ignored',
        },
      };

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    test('should fail with completely malformed options', async () => {
      const malformedOptions = {
        notValid: 'options',
      };

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            stateManager,
            agent,
            publicKeyCredentialRequestOptions:
              malformedOptions as unknown as PublicKeyCredentialRequestOptions,
            webAuthnCredential,
          }),
      ).rejects.toThrowError();
    });

    test('should fail with null in required field', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          challenge: null as unknown as Uint8Array_,
        },
      ) as unknown as PublicKeyCredentialRequestOptions;

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        }),
      ).rejects.toThrowError();
    });

    test('should fail with missing challenge', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
          challenge: undefined as unknown as Uint8Array_,
        },
      ) as unknown as PublicKeyCredentialRequestOptions;

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        }),
      ).rejects.toThrowError(ZodError);
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
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
        },
      );

      // First assertion
      const firstResult = await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });

      const firstCounter =
        firstResult.authenticationVerificationResponse.authenticationInfo
          .newCounter;
      expect(firstCounter).toBeGreaterThan(webAuthnCredential.counter);

      // Second assertion - counter should increment again
      const secondResult = await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });

      const secondCounter =
        secondResult.authenticationVerificationResponse.authenticationInfo
          .newCounter;
      expect(secondCounter).toBeGreaterThan(firstCounter);

      // Third assertion - counter should increment yet again
      const thirdResult = await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });

      const thirdCounter =
        thirdResult.authenticationVerificationResponse.authenticationInfo
          .newCounter;
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
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
        },
      );

      const meta: Partial<AuthenticatorAgentMetaArgs> = {
        userId: 'INVALID_USER_ID',
      };

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
          meta,
        }),
      ).rejects.toThrowError();
    });

    test('should throw error when userId is null', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
        },
      );

      const meta: Partial<AuthenticatorAgentMetaArgs> = {
        userId: null as unknown as string,
      };

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,

          meta,
        }),
      ).rejects.toThrowError();
    });

    test('should throw error when userId is empty string', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
        },
      );

      const meta: Partial<AuthenticatorAgentMetaArgs> = {
        userId: '',
      };

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
          meta,
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
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        stateManager,
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnCredential,
      });
    });

    test('should fail verification with mismatched origin', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: publicKeyCredential.rawId,
            },
          ],
        },
      );

      const meta: Partial<AuthenticatorAgentMetaArgs> = {
        origin: 'https://evil.com',
      };

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
          meta,
        }),
      ).rejects.toThrowError();
    });
  });

  describe('Client-side discovery', () => {
    test('For multiple credentials', async () => {
      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: undefined,
          rpId: RP_ID,
        },
      );

      const meta: AuthenticatorAgentMetaArgs = {
        userId: USER_ID,
        apiKeyId: null,
        userPresenceEnabled: true,
        userVerificationEnabled: true,
        origin: RP_ORIGIN,
      };

      const expectedAuthenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        allowCredentialDescriptorList: undefined,
      } as AuthenticatorGetAssertionArgs;

      const expectedAuthnenticatorMeta: AuthenticatorMetaArgs = {
        userId: USER_ID,
        apiKeyId: null,
        userPresenceEnabled: true,
        userVerificationEnabled: true,
      };

      const expectedAuthenticatorHash = Hash.sha256JSONHex({
        authenticatorGetAssertionArgs:
          AuthenticatorGetAssertionArgsDtoSchema.encode(
            expectedAuthenticatorGetAssertionArgs,
          ),
        meta: expectedAuthnenticatorMeta,
      });

      const expectedHash = Hash.sha256JSONHex({
        pkOptions: PublicKeyCredentialRequestOptionsDtoSchema.encode(
          publicKeyCredentialRequestOptions,
        ),
        meta,
      });

      // Create new credential first, then query expectedCredentialOptions
      // so that it includes both credentials (from beforeEach and this new one)
      await performPublicKeyCredentialRegistrationAndVerify({
        stateManager,
        agent,
        publicKeyCredentialCreationOptions:
          PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        meta,
      });

      const expectedCredentialOptions =
        await webAuthnPublicKeyCredentialRepository.findAllApplicableCredentialsByRpIdAndUserWithAllowCredentialDescriptorList(
          {
            rpId: RP_ID,
            userId: USER_ID,
            apiKeyId: null,
            allowCredentialDescriptorList: undefined,
          },
        );

      await expect(() =>
        performPublicKeyCredentialRequestAndVerify({
          stateManager,
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnCredential,
        }),
      ).rejects.toThrow(CredentialSelectAgentException);
    });
  });
});
