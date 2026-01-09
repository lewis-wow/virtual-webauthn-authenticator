import {
  upsertTestingUser,
  USER_ID,
  USER_NAME,
} from '../../../../auth/__tests__/helpers';

import { TypeAssertionError } from '@repo/assert';
import { Hash } from '@repo/crypto';
import { COSEKeyAlgorithm, COSEKeyParam } from '@repo/keys/cose/enums';
import { PrismaClient } from '@repo/prisma';
import * as cbor from 'cbor2';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';

import type { IAuthenticator } from '../../../src';
import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import {
  AuthenticatorDataParser,
  type IAttestationObjectMap,
} from '../../../src/cbor';
import { CollectedClientDataType, Fmt } from '../../../src/enums';
import { PublicKeyCredentialType } from '../../../src/enums/PublicKeyCredentialType';
import {
  CredentialTypesNotSupported,
  UserVerificationNotAvailable,
} from '../../../src/exceptions';
import { CredentialExcluded } from '../../../src/exceptions/CredentialExcluded';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import type {
  AuthenticatorContextArgs,
  AuthenticatorMakeCredentialArgs,
  AuthenticatorMetaArgs,
  CollectedClientData,
} from '../../../src/validation';
import { KeyVaultKeyIdGenerator } from '../../helpers/KeyVaultKeyIdGenerator';
import { MockKeyProvider } from '../../helpers/MockKeyProvider';
import {
  CHALLENGE_BYTES,
  RP_ID,
  RP_NAME,
  RP_ORIGIN,
  USER_DISPLAY_NAME,
  USER_ID_BYTSES,
} from '../../helpers/consts';

const COLLECTED_CLIENT_DATA: CollectedClientData = {
  type: CollectedClientDataType.WEBAUTHN_GET,
  challenge: Buffer.from(CHALLENGE_BYTES).toString('base64url'),
  origin: RP_ORIGIN,
  crossOrigin: false,
  topOrigin: undefined,
};

const CLIENT_DATA_JSON = new Uint8Array(
  Buffer.from(JSON.stringify(COLLECTED_CLIENT_DATA)),
);

const CLIENT_DATA_HASH = Hash.sha256(CLIENT_DATA_JSON);

const AUTHENTICATOR_MAKE_CREDENTIAL_ARGS: AuthenticatorMakeCredentialArgs = {
  attestationFormats: [],
  credTypesAndPubKeyAlgs: [
    { type: PublicKeyCredentialType.PUBLIC_KEY, alg: COSEKeyAlgorithm.ES256 },
  ],
  enterpriseAttestationPossible: false,
  excludeCredentialDescriptorList: undefined,
  extensions: {},
  hash: CLIENT_DATA_HASH,
  requireResidentKey: true,
  requireUserPresence: true,
  requireUserVerification: true,
  rpEntity: {
    id: RP_ID,
    name: RP_NAME,
  },
  userEntity: {
    id: USER_ID_BYTSES,
    name: USER_NAME,
    displayName: USER_DISPLAY_NAME,
  },
};

type PerformAuthenticatorMakeCredentialAndVerifyArgs = {
  authenticator: IAuthenticator;
  authenticatorMakeCredentialArgs: AuthenticatorMakeCredentialArgs;
  meta?: Partial<AuthenticatorMetaArgs>;
  context?: Partial<AuthenticatorContextArgs>;
};

const performAuthenticatorMakeCredentialAndVerify = async (
  opts: PerformAuthenticatorMakeCredentialAndVerifyArgs,
) => {
  const { authenticator, authenticatorMakeCredentialArgs, meta, context } =
    opts;

  const authenticatorMakeCredentialResponse =
    await authenticator.authenticatorMakeCredential({
      authenticatorMakeCredentialArgs,
      meta: {
        userId: USER_ID,
        userPresenceEnabled: true,
        userVerificationEnabled: true,
        ...meta,
      },
      context: {
        apiKeyId: null,
        ...context,
      },
    });

  const attestationObjectMap = cbor.decode<IAttestationObjectMap>(
    authenticatorMakeCredentialResponse.attestationObject,
    {
      preferMap: true,
    },
  );

  const authData = attestationObjectMap.get('authData');

  const authDataParser = new AuthenticatorDataParser(authData);

  expect(authDataParser.getAaguid()).toStrictEqual(VirtualAuthenticator.AAGUID);
  // New credential counter should be always 0
  expect(authDataParser.getCounter()).toBe(0);

  expect(authDataParser.isUserPresent()).toBe(true);
  expect(authDataParser.isBackupEligible()).toBe(true);
  expect(authDataParser.isBackedUp()).toBe(true);

  if (authenticatorMakeCredentialArgs.requireUserVerification) {
    expect(authDataParser.isUserVerified()).toBe(true);
  }

  expect(authDataParser.getExtensions()).toBe(null);
  expect(authDataParser.getRpIdHash()).toStrictEqual(Hash.sha256(RP_ID));

  return {
    response: authenticatorMakeCredentialResponse,
    attestationObjectMap,
    authDataParser,
  };
};

/**
 * Tests for VirtualAuthenticator.createCredential() method
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred
 * @see https://www.w3.org/TR/webauthn-3/#authenticatormakecredential
 *
 * Per spec: The authenticatorMakeCredential operation is used to create a new public key
 * credential source. This is part of the WebAuthn registration ceremony.
 */
describe('VirtualAuthenticator.authenticatorMakeCredential()', () => {
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

  const cleanupWebAuthnPublicKeyCredentials = async () => {
    await prisma.$transaction([
      prisma.webAuthnPublicKeyCredential.deleteMany(),
      prisma.webAuthnPublicKeyCredentialKeyVaultKeyMeta.deleteMany(),
    ]);
  };

  beforeAll(async () => {
    await upsertTestingUser({ prisma });
  });

  afterEach(async () => {
    await cleanupWebAuthnPublicKeyCredentials();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  describe('AuthenticatorMakeCredentialArgs.requireUserPresence', () => {
    test('args.requireUserPresence: true, meta.userPresenceEnabled: true', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        requireUserPresence: true,
      } as AuthenticatorMakeCredentialArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userPresenceEnabled: true,
      };

      await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        authenticatorMakeCredentialArgs,
        meta,
      });
    });

    test('args.requireUserPresence: true, meta.userPresenceEnabled: false', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        requireUserPresence: true,
      } as AuthenticatorMakeCredentialArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        // userPresenceEnabled must be `true`
        userPresenceEnabled: false as true,
      };

      await expect(() =>
        performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          authenticatorMakeCredentialArgs,
          meta,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    test('args.requireUserPresence: false, meta.userPresenceEnabled: true', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        // requireUserPresence must be `true`
        requireUserPresence: false as true,
      } as AuthenticatorMakeCredentialArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userPresenceEnabled: true,
      };

      await expect(() =>
        performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          authenticatorMakeCredentialArgs,
          meta,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    test('args.requireUserPresence: false, meta.userPresenceEnabled: false', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        // requireUserPresence must be `true`
        requireUserPresence: false as true,
      } as AuthenticatorMakeCredentialArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        // userPresenceEnabled must be `true`
        userPresenceEnabled: false as true,
      };

      await expect(() =>
        performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          authenticatorMakeCredentialArgs,
          meta,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });
  });

  describe('AuthenticatorMakeCredentialArgs.requireUserPresence', () => {
    test('args.requireUserVerification: true, meta.userVerificationEnabled: true', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        requireUserVerification: true,
      } as AuthenticatorMakeCredentialArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userVerificationEnabled: true,
      };

      await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        authenticatorMakeCredentialArgs,
        meta,
      });
    });

    test('args.requireUserVerification: true, meta.userVerificationEnabled: false', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        requireUserVerification: true,
      } as AuthenticatorMakeCredentialArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userVerificationEnabled: false,
      };

      await expect(() =>
        performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          authenticatorMakeCredentialArgs,
          meta,
        }),
      ).rejects.toThrowError(new UserVerificationNotAvailable());
    });

    test('args.requireUserVerification: false, meta.userVerificationEnabled: true', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        requireUserVerification: false,
      } as AuthenticatorMakeCredentialArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userVerificationEnabled: true,
      };

      await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        authenticatorMakeCredentialArgs,
        meta,
      });
    });

    test('args.requireUserVerification: false, meta.userVerificationEnabled: false', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        requireUserVerification: false,
      } as AuthenticatorMakeCredentialArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userVerificationEnabled: false,
      };

      await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        authenticatorMakeCredentialArgs,
        meta,
      });
    });
  });

  describe('AuthenticatorMakeCredentialArgs.enterpriseAttestationPossible', () => {
    test('args.enterpriseAttestationPossible: false', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        enterpriseAttestationPossible: false,
      } as AuthenticatorMakeCredentialArgs;

      await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        authenticatorMakeCredentialArgs,
      });
    });

    test('args.enterpriseAttestationPossible: true', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        enterpriseAttestationPossible: true,
      } as AuthenticatorMakeCredentialArgs;

      const { attestationObjectMap } =
        await performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          authenticatorMakeCredentialArgs,
        });

      // Most preferable format by the authenticator
      expect(attestationObjectMap.get('fmt')).toBe(
        VirtualAuthenticator.MOST_PREFFERED_ATTESTATION_FORMAT,
      );
    });
  });

  describe('AuthenticatorMakeCredentialArgs.attestationFormats', () => {
    test.each(
      [
        { attestationFormats: [Fmt.NONE], expectedFmt: Fmt.NONE },
        { attestationFormats: [Fmt.PACKED], expectedFmt: Fmt.PACKED },
        // Empty
        {
          attestationFormats: [],
          expectedFmt: VirtualAuthenticator.MOST_PREFFERED_ATTESTATION_FORMAT,
        },
        // Not supported formats
        {
          attestationFormats: [Fmt.TPM],
          expectedFmt: VirtualAuthenticator.MOST_PREFFERED_ATTESTATION_FORMAT,
        },
        {
          attestationFormats: [
            Fmt.TPM,
            Fmt.ANDROID_KEY,
            Fmt.APPLE_ANONYMOUS,
            Fmt.ANDROID_SAFETYNET,
          ],
          expectedFmt: VirtualAuthenticator.MOST_PREFFERED_ATTESTATION_FORMAT,
        },
        // At least one supported format
        {
          attestationFormats: [
            Fmt.TPM,
            Fmt.ANDROID_KEY,
            Fmt.PACKED,
            Fmt.ANDROID_SAFETYNET,
          ],
          expectedFmt: Fmt.PACKED,
        },
        {
          attestationFormats: [
            Fmt.TPM,
            Fmt.ANDROID_KEY,
            Fmt.NONE,
            Fmt.ANDROID_SAFETYNET,
          ],
          expectedFmt: Fmt.NONE,
        },
      ].map((testCase) => ({
        ...testCase,
        // Create a clean string representation, e.g., "TPM, ANDROID_KEY"
        attestationFormatsDisplay: testCase.attestationFormats.join(', '),
      })),
    )(
      'args.attestationFormats: $attestationFormatsDisplay',
      async ({ attestationFormats, expectedFmt }) => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          attestationFormats,
        } as AuthenticatorMakeCredentialArgs;

        const { attestationObjectMap } =
          await performAuthenticatorMakeCredentialAndVerify({
            authenticator,
            authenticatorMakeCredentialArgs,
          });

        expect(attestationObjectMap.get('fmt')).toBe(expectedFmt);
      },
    );
  });

  describe('AuthenticatorMakeCredentialArgs.credTypesAndPubKeyAlgs', () => {
    test.each(
      [
        // ONLY Supported algorithms
        {
          credTypesAndPubKeyAlgs: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: COSEKeyAlgorithm.ES256,
            },
          ],
          expectedCOSEKeyAlgorithm: COSEKeyAlgorithm.ES256,
        },
        {
          credTypesAndPubKeyAlgs: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: COSEKeyAlgorithm.ES256,
            },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: COSEKeyAlgorithm.ES384,
            },
          ],
          expectedCOSEKeyAlgorithm: COSEKeyAlgorithm.ES256,
        },
        // At least one supported algorithm
        {
          credTypesAndPubKeyAlgs: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: 6,
            },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: COSEKeyAlgorithm.ES384,
            },
          ],
          expectedCOSEKeyAlgorithm: COSEKeyAlgorithm.ES256,
        },
        {
          credTypesAndPubKeyAlgs: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: 3,
            },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: 6,
            },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: COSEKeyAlgorithm.ES384,
            },
          ],
          expectedCOSEKeyAlgorithm: COSEKeyAlgorithm.ES256,
        },
      ].map((testCase) => ({
        ...testCase,
        // Create a clean string representation, e.g., "TPM, ANDROID_KEY"
        credTypesAndPubKeyAlgsDisplay: testCase.credTypesAndPubKeyAlgs
          .map(
            (credTypesAndPubKeyAlg) =>
              `${credTypesAndPubKeyAlg.type}:${credTypesAndPubKeyAlg.alg}`,
          )
          .join(', '),
      })),
    )(
      'At least one supported args.credTypesAndPubKeyAlgs $credTypesAndPubKeyAlgsDisplay',
      async ({ credTypesAndPubKeyAlgs, expectedCOSEKeyAlgorithm }) => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          credTypesAndPubKeyAlgs,
        } as AuthenticatorMakeCredentialArgs;

        const { authDataParser } =
          await performAuthenticatorMakeCredentialAndVerify({
            authenticator,
            authenticatorMakeCredentialArgs,
          });

        const COSEPublicKey = authDataParser.getPublicKey();

        const COSEKeyAlgorithm = COSEPublicKey?.get(COSEKeyParam.alg);

        expect(COSEKeyAlgorithm).toBe(expectedCOSEKeyAlgorithm);
      },
    );

    test.each(
      [
        {
          credTypesAndPubKeyAlgs: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: 7,
            },
          ],
          expectedError: new CredentialTypesNotSupported(),
        },
        {
          credTypesAndPubKeyAlgs: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: 7,
            },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: 8,
            },
          ],
          expectedError: new CredentialTypesNotSupported(),
        },
        {
          credTypesAndPubKeyAlgs: [
            {
              type: 'INVALID_TYPE',
              alg: 7,
            },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: 8,
            },
          ],
          expectedError: new TypeAssertionError(),
        },
      ].map((testCase) => ({
        ...testCase,
        // Create a clean string representation, e.g., "TPM, ANDROID_KEY"
        credTypesAndPubKeyAlgsDisplay: testCase.credTypesAndPubKeyAlgs
          .map(
            (credTypesAndPubKeyAlg) =>
              `${credTypesAndPubKeyAlg.type}:${credTypesAndPubKeyAlg.alg}`,
          )
          .join(', '),
      })),
    )(
      'No supported args.credTypesAndPubKeyAlgs $credTypesAndPubKeyAlgsDisplay',
      async ({ credTypesAndPubKeyAlgs, expectedError }) => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          credTypesAndPubKeyAlgs,
        } as AuthenticatorMakeCredentialArgs;

        await expect(() =>
          performAuthenticatorMakeCredentialAndVerify({
            authenticator,
            authenticatorMakeCredentialArgs,
          }),
        ).rejects.toThrowError(expectedError);
      },
    );
  });

  describe('AuthenticatorMakeCredentialArgs.excludeCredentialDescriptorList', () => {
    let credentialId: Uint8Array;

    beforeEach(async () => {
      const { response } = await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        authenticatorMakeCredentialArgs: AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
      });

      credentialId = response.credentialId;
    });

    test('Credential excluded', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        excludeCredentialDescriptorList: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: credentialId,
          },
        ],
      } as AuthenticatorMakeCredentialArgs;

      await expect(() =>
        performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          authenticatorMakeCredentialArgs,
        }),
      ).rejects.toThrowError(new CredentialExcluded());
    });

    test('Invalid empty args.excludeCredentialDescriptorList', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        excludeCredentialDescriptorList: [],
      } as AuthenticatorMakeCredentialArgs;

      await expect(() =>
        performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          authenticatorMakeCredentialArgs,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    test('Valid undefined args.excludeCredentialDescriptorList - Should create new credential', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        excludeCredentialDescriptorList: undefined,
      } as AuthenticatorMakeCredentialArgs;

      await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        authenticatorMakeCredentialArgs,
      });
    });
  });
});
