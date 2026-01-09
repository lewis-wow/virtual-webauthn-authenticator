import { upsertTestingUser, USER_ID } from '../../../../auth/__tests__/helpers';
import { set } from '@repo/core/__tests__/helpers';

import { TypeAssertionError } from '@repo/assert';
import { UUIDMapper } from '@repo/core/mappers';
import { PrismaClient } from '@repo/prisma';
import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
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

import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import { VirtualAuthenticatorAgent } from '../../../src/VirtualAuthenticatorAgent';
import { PublicKeyCredentialDtoSchema } from '../../../src/dto/spec/PublicKeyCredentialDtoSchema';
import { PublicKeyCredentialType } from '../../../src/enums/PublicKeyCredentialType';
import { UserVerification } from '../../../src/enums/UserVerification';
import { CredentialNotFound } from '../../../src/exceptions/CredentialNotFound';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import type { PublicKeyCredentialRequestOptions } from '../../../src/validation/spec/PublicKeyCredentialRequestOptionsSchema';
import { KeyVaultKeyIdGenerator } from '../../helpers/KeyVaultKeyIdGenerator';
import { MockKeyProvider } from '../../helpers/MockKeyProvider';
import {
  CHALLENGE_BASE64URL,
  CHALLENGE_BYTES,
  PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
  RP_ID,
  RP_ORIGIN,
} from '../../helpers/consts';
import { generateRandomUUIDBytes } from '../../helpers/generateRandomUUIDBytes';
import { performPublicKeyCredentialRequestAndVerify } from '../../helpers/performPublicKeyCredentialRequestAndVerify';

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
  const agent = new VirtualAuthenticatorAgent({ authenticator });

  const cleanupWebAuthnPublicKeyCredentials = async () => {
    await prisma.$transaction([
      prisma.webAuthnPublicKeyCredential.deleteMany(),
      prisma.webAuthnPublicKeyCredentialKeyVaultKeyMeta.deleteMany(),
    ]);
  };

  let registrationInfo: {
    webAuthnPublicKeyCredentialId: string;
    webAuthnPublicKeyCredentialIdBytes: Uint8Array;
    publicKey: Uint8Array<ArrayBuffer>;
    counter: number;
  };

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
    // Simulate the full WebAuthn registration ceremony.
    // This creates a new public key credential (passkey) using the
    // specified options, public key, and key vault metadata.
    const publicKeyCredential = await agent.createCredential({
      origin: RP_ORIGIN,
      options: {
        publicKey: PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
      },
      sameOriginWithAncestors: true,

      // Internal options
      meta: {
        userId: USER_ID,
        origin: RP_ORIGIN,

        userPresenceEnabled: true,
        userVerificationEnabled: true,
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
      requireUserVerification: false,
    });

    registrationInfo = {
      publicKey:
        registrationVerification.registrationInfo!.credential.publicKey,
      webAuthnPublicKeyCredentialId: UUIDMapper.bytesToUUID(
        publicKeyCredential.rawId,
      ),
      webAuthnPublicKeyCredentialIdBytes: publicKeyCredential.rawId,
      counter: registrationVerification.registrationInfo!.credential.counter,
    };
  });

  /**
   * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
   * Per spec: The authenticator should produce a valid assertion that can be verified
   */
  test('should produce a verifiable assertion', async () => {
    const {
      webAuthnPublicKeyCredentialIdBytes,
      webAuthnPublicKeyCredentialId,
      publicKey,
      counter,
    } = registrationInfo;

    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: webAuthnPublicKeyCredentialIdBytes,
          },
        ],
      },
    );

    await performPublicKeyCredentialRequestAndVerify({
      agent,
      publicKeyCredentialRequestOptions,
      webAuthnPublicKeyCredentialId,
      publicKey,
      counter,
    });
  });

  /**
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-allowcredentials
   * Per spec: If allowCredentials is undefined or empty, the authenticator should
   * use discoverable credentials associated with the RP ID
   */
  test('should produce a verifiable assertion without allowCredentials', async () => {
    const { webAuthnPublicKeyCredentialId, publicKey, counter } =
      registrationInfo;

    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        allowCredentials: undefined,
      },
    );

    await performPublicKeyCredentialRequestAndVerify({
      agent,
      publicKeyCredentialRequestOptions,
      webAuthnPublicKeyCredentialId,
      publicKey,
      counter,
    });
  });

  /**
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-allowcredentials
   * Per spec: The authenticator should find the matching credential even when
   * allowCredentials contains additional non-matching credential IDs
   */
  test('should produce a verifiable assertion with redundant allowCredentials', async () => {
    const {
      webAuthnPublicKeyCredentialId,
      webAuthnPublicKeyCredentialIdBytes,
      publicKey,
      counter,
    } = registrationInfo;

    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        allowCredentials: [
          { id: generateRandomUUIDBytes(), type: 'public-key' },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: webAuthnPublicKeyCredentialIdBytes,
          },
        ],
      },
    );

    await performPublicKeyCredentialRequestAndVerify({
      agent,
      publicKeyCredentialRequestOptions,
      webAuthnPublicKeyCredentialId,
      publicKey,
      counter,
    });
  });

  /**
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrequestoptions-rpid
   * @see https://www.w3.org/TR/webauthn-3/#relying-party-identifier
   * Per spec: The RP ID must match the credential's RP ID for authentication to succeed
   */
  test('should fail when RP ID differ from Origin', async () => {
    const {
      webAuthnPublicKeyCredentialId,
      webAuthnPublicKeyCredentialIdBytes,
      publicKey,
      counter,
    } = registrationInfo;

    const rpId = 'different-example.com';

    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        rpId,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: webAuthnPublicKeyCredentialIdBytes,
          },
        ],
      },
    );

    await expect(
      async () =>
        await performPublicKeyCredentialRequestAndVerify({
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnPublicKeyCredentialId,
          publicKey,
          counter,
        }),
    ).to.rejects.toThrowError(new TypeAssertionError());
  });

  test('should fail with different user ID', async () => {
    const {
      webAuthnPublicKeyCredentialIdBytes,
      webAuthnPublicKeyCredentialId,
      publicKey,
      counter,
    } = registrationInfo;

    const userId = 'WRONG_USER_ID';

    const publicKeyCredentialRequestOptions = set(
      PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
      {
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: webAuthnPublicKeyCredentialIdBytes,
          },
        ],
      },
    );

    await expect(
      async () =>
        await performPublicKeyCredentialRequestAndVerify({
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnPublicKeyCredentialId,
          publicKey,
          counter,
          userId,
        }),
    ).to.rejects.toThrowError(new CredentialNotFound());
  });

  test('should fail with wrong allowCredentials', async () => {
    const { webAuthnPublicKeyCredentialId, publicKey, counter } =
      registrationInfo;

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
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnPublicKeyCredentialId,
          publicKey,
          counter,
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
    describe.each([
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
    ])('With userVerification $userVerification', ({ userVerification }) => {
      test('should produce a verifiable assertion', async () => {
        const {
          webAuthnPublicKeyCredentialIdBytes,
          webAuthnPublicKeyCredentialId,
          publicKey,
          counter,
        } = registrationInfo;

        const publicKeyCredentialRequestOptions = set(
          PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
          {
            allowCredentials: [
              {
                type: PublicKeyCredentialType.PUBLIC_KEY,
                id: webAuthnPublicKeyCredentialIdBytes,
              },
            ],
            userVerification,
          },
        );

        const { authenticationVerification } =
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
          });

        // Per spec, if userVerification is 'required', the UV flag must be set
        if (userVerification === UserVerification.REQUIRED) {
          expect(
            authenticationVerification.authenticationInfo.userVerified,
          ).toBe(true);
        }
      });
    });

    test('should throw type mismatch when userVerification is not in enum', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          userVerification: 'INVALID_USER_VERIFICATION' as UserVerification,
        },
      ) as unknown as PublicKeyCredentialRequestOptions;

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
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
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          userVerification: UserVerification.REQUIRED,
        },
      );

      const { authenticationVerification } =
        await performPublicKeyCredentialRequestAndVerify({
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnPublicKeyCredentialId,
          publicKey,
          counter,
        });

      // Per spec: UV flag (bit 2) must be set when userVerification is required
      expect(authenticationVerification.authenticationInfo.userVerified).toBe(
        true,
      );
      // UP flag (bit 0) should also be set as user presence is implicit
      expect(authenticationVerification.verified).toBe(true);
    });

    test('should set UP flag for all assertions', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          userVerification: UserVerification.DISCOURAGED,
        },
      );

      const { authenticationVerification } =
        await performPublicKeyCredentialRequestAndVerify({
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnPublicKeyCredentialId,
          publicKey,
          counter,
        });

      // Per spec: UP flag (bit 0) should always be set for valid assertions
      // (user presence is required for all WebAuthn operations)
      expect(authenticationVerification.verified).toBe(true);
    });

    test('should not set AT flag in assertion (only in registration)', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
        },
      );

      const { authenticationVerification } =
        await performPublicKeyCredentialRequestAndVerify({
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnPublicKeyCredentialId,
          publicKey,
          counter,
        });

      // Per spec: AT flag (bit 6) should NOT be set in assertion authenticatorData
      // (attested credential data is only included during registration)
      expect(authenticationVerification.verified).toBe(true);
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
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          timeout,
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
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
      const { webAuthnPublicKeyCredentialId, publicKey, counter } =
        registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [],
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });
    });

    test('should work with multiple allowCredentials including the correct one', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

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
              id: webAuthnPublicKeyCredentialIdBytes,
            },
            {
              id: generateRandomUUIDBytes(),
              type: PublicKeyCredentialType.PUBLIC_KEY,
            },
          ],
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
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
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          rpId: RP_ID,
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });
    });

    test('should throw type mismatch when rpId is not a string', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          rpId: 12345 as unknown as string,
        },
      ) as unknown as PublicKeyCredentialRequestOptions;

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
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
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const challenge = new Uint8Array(randomBytes(16));

      const publicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: webAuthnPublicKeyCredentialIdBytes,
          },
        ],
      };

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
        expectedChallenge: Buffer.from(challenge).toString('base64url'),
      });
    });

    test('should fail with challenge less than 16 bytes (spec recommends at least 16)', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const challenge = new Uint8Array(randomBytes(15));

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          challenge,
        },
      );

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
          }),
      ).rejects.toThrowError();
    });

    test('should fail with empty challenge (0 bytes)', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const challenge = new Uint8Array(0);

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          challenge,
        },
      );

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
          }),
      ).rejects.toThrowError();
    });

    test('should work with very large challenge (1024 bytes)', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const challenge = new Uint8Array(randomBytes(1024));

      const publicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: webAuthnPublicKeyCredentialIdBytes,
          },
        ],
      };

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
        expectedChallenge: Buffer.from(challenge).toString('base64url'),
      });
    });

    test('should fail when challenge is not Uint8Array', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          challenge: 'not-a-uint8array' as unknown as Uint8Array,
        },
      ) as unknown as PublicKeyCredentialRequestOptions;

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
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
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const minChallenge = new Uint8Array(randomBytes(16));

      const publicKeyCredentialRequestOptions = {
        challenge: minChallenge,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: webAuthnPublicKeyCredentialIdBytes,
          },
        ],
      };

      const { authenticationVerification } =
        await performPublicKeyCredentialRequestAndVerify({
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnPublicKeyCredentialId,
          publicKey,
          counter,
          expectedChallenge: Buffer.from(minChallenge).toString('base64url'),
        });

      // Verify signature was correctly created and verified
      expect(authenticationVerification.verified).toBe(true);
    });

    test('should create valid signature with large challenge size (512 bytes)', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const largeChallenge = new Uint8Array(randomBytes(512));

      const publicKeyCredentialRequestOptions = {
        challenge: largeChallenge,
        allowCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: webAuthnPublicKeyCredentialIdBytes,
          },
        ],
      };

      const { authenticationVerification } =
        await performPublicKeyCredentialRequestAndVerify({
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnPublicKeyCredentialId,
          publicKey,
          counter,
          expectedChallenge: Buffer.from(largeChallenge).toString('base64url'),
        });

      // Verify signature was correctly created and verified
      expect(authenticationVerification.verified).toBe(true);
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
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          extensions: undefined,
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });
    });

    test('should work with empty extensions object', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          extensions: {},
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-appid-extension
     * Per spec: appid extension allows authentication with credentials registered with FIDO U2F
     */
    test('should work with appid extension', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          extensions: {
            appid: 'https://example.com/appid.json',
          },
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });
    });

    /**
     * @see https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-errata-20220621.html#sctn-hmac-secret-extension
     * Per CTAP2: hmac-secret extension for symmetric secret operations
     */
    test('should work with hmac-secret extension', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
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

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-large-blob-extension
     * Per spec: largeBlob extension for reading/writing large blob data
     */
    test('should work with largeBlob extension (read)', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          extensions: {
            largeBlob: {
              read: true,
            },
          },
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });
    });

    test('should work with largeBlob extension (write)', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          extensions: {
            largeBlob: {
              write: new Uint8Array([1, 2, 3, 4, 5]),
            },
          },
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-extensions
     * Per spec: "Authenticators MUST ignore any extensions that they do not recognize."
     */
    test('should ignore unknown/unsupported extensions', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          extensions: {
            unknownExtension: 'some-value',
            anotherUnknown: { complex: 'object' },
          },
        },
      );

      // Per spec, unknown extensions should be ignored, not cause errors
      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });
    });

    test('should work with multiple extensions combined', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
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

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
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
      const { webAuthnPublicKeyCredentialId, publicKey, counter } =
        registrationInfo;

      const challenge = new Uint8Array(randomBytes(32));

      // Only required field per spec is challenge
      const publicKeyCredentialRequestOptions = {
        challenge,
      };

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
        expectedChallenge: Buffer.from(challenge).toString('base64url'),
      });
    });

    /**
     * Step 3: Tests for allowCredentialDescriptorList credential lookup
     * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion (step 3)
     *
     * The malformed credential IDs are simply ommited.
     */
    test('Should work with malformed credential IDs in allowCredentials', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

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
              id: webAuthnPublicKeyCredentialIdBytes, // Valid credential
            },
          ],
        },
      );

      const { authenticationVerification } =
        await performPublicKeyCredentialRequestAndVerify({
          agent,
          publicKeyCredentialRequestOptions,
          webAuthnPublicKeyCredentialId,
          publicKey,
          counter,
        });

      expect(authenticationVerification.authenticationInfo.credentialID).toBe(
        webAuthnPublicKeyCredentialId,
      );
    });

    /**
     * Step 3: Test that allowCredentials filters correctly with non-matching IDs
     * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion (step 3)
     */
    test('Should fail when allowCredentials contains only non-matching credential IDs', async () => {
      const { webAuthnPublicKeyCredentialId, publicKey, counter } =
        registrationInfo;

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

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
          }),
      ).rejects.toThrowError(new CredentialNotFound());
    });

    test('should work with all fields at maximum complexity', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

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
            id: webAuthnPublicKeyCredentialIdBytes,
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
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
        expectedChallenge: Buffer.from(largeChallenge).toString('base64url'),
      });
    });

    test('should fail with completely malformed options', async () => {
      const { webAuthnPublicKeyCredentialId, publicKey, counter } =
        registrationInfo;

      const malformedOptions = {
        notValid: 'options',
      };

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions:
              malformedOptions as unknown as PublicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
          }),
      ).rejects.toThrowError();
    });

    test('should fail with null in required field', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          challenge: null as unknown as Uint8Array,
        },
      ) as unknown as PublicKeyCredentialRequestOptions;

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
          }),
      ).rejects.toThrowError();
    });

    test('should fail with missing challenge', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
          challenge: undefined as unknown as Uint8Array,
        },
      ) as unknown as PublicKeyCredentialRequestOptions;

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
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
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
        },
      );

      // First assertion
      const firstResult = await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });

      const firstCounter =
        firstResult.authenticationVerification.authenticationInfo.newCounter;
      expect(firstCounter).toBeGreaterThan(counter);

      // Second assertion - counter should increment again
      const secondResult = await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter: firstCounter,
      });

      const secondCounter =
        secondResult.authenticationVerification.authenticationInfo.newCounter;
      expect(secondCounter).toBeGreaterThan(firstCounter);

      // Third assertion - counter should increment yet again
      const thirdResult = await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter: secondCounter,
      });

      const thirdCounter =
        thirdResult.authenticationVerification.authenticationInfo.newCounter;
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
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
        },
      );

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
            userId: 'INVALID_USER_ID',
          }),
      ).rejects.toThrowError();
    });

    test('should throw error when userId is null', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
        },
      );

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
            userId: null as unknown as string,
          }),
      ).rejects.toThrowError();
    });

    test('should throw error when userId is empty string', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
        },
      );

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
            userId: '',
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
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
        },
      );

      await performPublicKeyCredentialRequestAndVerify({
        agent,
        publicKeyCredentialRequestOptions,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      });
    });

    test('should fail verification with mismatched origin', async () => {
      const {
        webAuthnPublicKeyCredentialIdBytes,
        webAuthnPublicKeyCredentialId,
        publicKey,
        counter,
      } = registrationInfo;

      const publicKeyCredentialRequestOptions = set(
        PUBLIC_KEY_CREDENTIAL_REQUEST_OPTIONS,
        {
          allowCredentials: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              id: webAuthnPublicKeyCredentialIdBytes,
            },
          ],
        },
      );

      const wrongOrigin = 'https://evil.com';

      await expect(
        async () =>
          await performPublicKeyCredentialRequestAndVerify({
            agent,
            publicKeyCredentialRequestOptions,
            webAuthnPublicKeyCredentialId,
            publicKey,
            counter,
            origin: wrongOrigin,
          }),
      ).rejects.toThrowError();
    });
  });
});
