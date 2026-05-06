import { upsertTestingUser, USER_ID } from '../../../../jwt/__tests__/helpers';

import { TypeAssertionError } from '@repo/assert';
import { encodeCOSEPublicKey } from '@repo/keys/cbor';
import { COSEKeyAlgorithm, COSEKeyParam } from '@repo/keys/enums';
import { PrismaClient } from '@repo/prisma';
import type { Uint8Array_ } from '@repo/types';
import { bytesToUuid } from '@repo/utils';
import { verifySignature } from '@simplewebauthn/server/helpers';
import { randomUUID } from 'node:crypto';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';

import { AuthorizationGesture } from '../../../src/AuthorizationGesture';
import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import { AttestationHandlerRegistry } from '../../../src/attestationHandlers/AttestationHandlerRegistry';
import { AttestationProcessor } from '../../../src/attestationHandlers/AttestationProcessor';
import { NoneAttestationHandler } from '../../../src/attestationHandlers/NoneAttestationHandler';
import { PackedAttestationHandler } from '../../../src/attestationHandlers/PackedAttestationHandler';
import { Fmt } from '../../../src/enums';
import { PublicKeyCredentialType } from '../../../src/enums/PublicKeyCredentialType';
import { VirtualAuthenticatorUserVerificationType } from '../../../src/enums/VirtualAuthenticatorUserVerificationType';
import {
  CredentialTypesNotSupported,
  UserNotExists,
  UserVerificationNotAvailable,
} from '../../../src/exceptions';
import { CredentialExcluded } from '../../../src/exceptions/CredentialExcluded';
import { UserPresenceRequired } from '../../../src/exceptions/UserPresenceRequired';
import { UserVerificationRequired } from '../../../src/exceptions/UserVerificationRequired';
import { PrismaWebAuthnRepository } from '../../../src/repositories/webAuthnPublicKeyRepository/PrismaWebAuthnRepository';
import type { RegistrationState } from '../../../src/state/RegistrationStateSchema';
import type { AuthenticatorMakeCredentialArgs } from '../../../src/validation/AuthenticatorMakeCredentialArgsSchema';
import type { AuthenticatorMetaArgs } from '../../../src/validation/AuthenticatorMetaArgsSchema';
import { KeyVaultKeyIdGenerator } from '../../helpers/KeyVaultKeyIdGenerator';
import { MockKeyProvider } from '../../helpers/MockKeyProvider';
import { MockVirtualAuthenticatorRepository } from '../../helpers/MockVirtualAuthenticatorRepository';
import { VIRTUAL_AUTHENTICATOR_ID } from '../../helpers/consts';
import {
  AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
  CLIENT_DATA_HASH,
  performAuthenticatorMakeCredentialAndVerify,
} from './performAuthenticatorMakeCredentialAndVerify';

const cleanupWebAuthnPublicKeyCredentials = async (opts: {
  prisma: PrismaClient;
}) => {
  const { prisma } = opts;

  await prisma.$transaction([
    prisma.webAuthnPublicKeyCredential.deleteMany(),
    prisma.webAuthnPublicKeyCredentialKeyVaultKeyMeta.deleteMany(),
  ]);
};

const upsertVirtualAuthenticator = async (opts: { prisma: PrismaClient }) => {
  const { prisma } = opts;

  await prisma.virtualAuthenticator.upsert({
    where: { id: VIRTUAL_AUTHENTICATOR_ID },
    update: {},
    create: {
      id: VIRTUAL_AUTHENTICATOR_ID,
      userId: USER_ID,
      userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
    },
  });
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

  const virtualAuthenticatorRepository =
    new MockVirtualAuthenticatorRepository();

  const authorizationGesture = new AuthorizationGesture({
    virtualAuthenticatorRepository,
  });

  const attestationHandlerRegistry =
    new AttestationHandlerRegistry().registerAll([
      new NoneAttestationHandler(),
      new PackedAttestationHandler({ keyProvider }),
    ]);

  const attestationProcessor = new AttestationProcessor(
    attestationHandlerRegistry,
  );

  const authenticator = new VirtualAuthenticator({
    webAuthnRepository: webAuthnPublicKeyCredentialRepository,
    virtualAuthenticatorRepository,
    keyProvider,
    authorizationGesture,
    attestationProcessor,
  });

  beforeAll(async () => {
    await upsertTestingUser({ prisma });
    await upsertVirtualAuthenticator({ prisma });
  });

  afterEach(async () => {
    await cleanupWebAuthnPublicKeyCredentials({ prisma });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  // Tests:
  describe('args.requireUserPresence', () => {
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
        prisma,
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
        userPresenceEnabled: false,
      };

      await expect(() =>
        performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          prisma,
          authenticatorMakeCredentialArgs,
          meta,
        }),
      ).rejects.toThrowError(TypeAssertionError);
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
          prisma,
          authenticatorMakeCredentialArgs,
          meta,
        }),
      ).rejects.toThrowError(TypeAssertionError);
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
          prisma,
          authenticatorMakeCredentialArgs,
          meta,
        }),
      ).rejects.toThrowError(TypeAssertionError);
    });
  });

  describe('args.requireUserVerification', () => {
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
        prisma,
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
          prisma,
          authenticatorMakeCredentialArgs,
          meta,
        }),
      ).rejects.toThrowError(UserVerificationNotAvailable);
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
        prisma,
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
        prisma,
        authenticatorMakeCredentialArgs,
        meta,
      });
    });
  });

  describe('args.requireResidentKey', () => {
    // Discoverable (Resident Key): Private key stored in Authenticator database - Key Vault in this implementation.
    // Non-Discoverable (Non-Resident Key): Private key stored on RP Server databse (as an encrypted blob) - Not in this implementation.
    // The credential is discoverable if requireResidentKey is true or the authenticator chooses to create a client-side discoverable credential.
    test.each([
      // In both cases, the credential is client-side discoverable (Resident).
      {
        requireResidentKey: false,
      },
      {
        requireResidentKey: true,
      },
    ])(
      'args.requireResidentKey $requireResidentKey',
      async ({ requireResidentKey }) => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          requireResidentKey,
        } as AuthenticatorMakeCredentialArgs;

        await performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          prisma,
          authenticatorMakeCredentialArgs,
        });
      },
    );
  });

  describe('args.enterpriseAttestationPossible', () => {
    test.each([
      { enterpriseAttestationPossible: false },
      { enterpriseAttestationPossible: true },
    ])(
      'args.enterpriseAttestationPossible: $enterpriseAttestationPossible',
      async ({ enterpriseAttestationPossible }) => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          enterpriseAttestationPossible,
        };

        const { attestationObjectMap } =
          await performAuthenticatorMakeCredentialAndVerify({
            authenticator,
            prisma,
            authenticatorMakeCredentialArgs,
          });

        // Most preferable format by the authenticator
        expect(attestationObjectMap.get('fmt')).toBe(
          VirtualAuthenticator.MOST_PREFFERED_ATTESTATION_FORMAT,
        );
      },
    );
  });

  describe('args.attestationFormats', () => {
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
        };

        const { attestationObjectMap } =
          await performAuthenticatorMakeCredentialAndVerify({
            authenticator,
            prisma,
            authenticatorMakeCredentialArgs,
          });

        expect(attestationObjectMap.get('fmt')).toBe(expectedFmt);
      },
    );
  });

  describe('args.credTypesAndPubKeyAlgs', () => {
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
          expectedCOSEKeyAlgorithm: COSEKeyAlgorithm.ES384,
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
          expectedCOSEKeyAlgorithm: COSEKeyAlgorithm.ES384,
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
        };

        const { parsedAuthenticatorData } =
          await performAuthenticatorMakeCredentialAndVerify({
            authenticator,
            prisma,
            authenticatorMakeCredentialArgs,
          });

        const COSEPublicKey = parsedAuthenticatorData.credentialPublicKey;

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
      'No supported args.credTypesAndPubKeyAlgs: $credTypesAndPubKeyAlgsDisplay',
      async ({ credTypesAndPubKeyAlgs, expectedError }) => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          credTypesAndPubKeyAlgs,
        } as AuthenticatorMakeCredentialArgs;

        await expect(() =>
          performAuthenticatorMakeCredentialAndVerify({
            authenticator,
            prisma,
            authenticatorMakeCredentialArgs,
          }),
        ).rejects.toThrowError(expectedError);
      },
    );
  });

  describe('args.excludeCredentialDescriptorList', () => {
    let credentialId: Uint8Array_;

    beforeEach(async () => {
      const { response } = await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        prisma,
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
          prisma,
          authenticatorMakeCredentialArgs,
        }),
      ).rejects.toThrowError(CredentialExcluded);
    });

    test('No credential excluded with non-uuid credential ids', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        excludeCredentialDescriptorList: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: new Uint8Array(Buffer.from('SOME_ID')),
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            // Empty id
            id: new Uint8Array([]),
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: credentialId,
          },
        ],
      } as AuthenticatorMakeCredentialArgs;

      await expect(() =>
        performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          prisma,
          authenticatorMakeCredentialArgs,
        }),
      ).rejects.toThrowError(CredentialExcluded);
    });

    test('No credential excluded because of different RP ID', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        rpEntity: {
          id: 'another-rp.id',
          name: 'ANOTHER_RP_NAME',
        },
        excludeCredentialDescriptorList: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: credentialId,
          },
        ],
      } as AuthenticatorMakeCredentialArgs;

      await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        prisma,
        authenticatorMakeCredentialArgs,
      });
    });

    test.each([
      {
        excludeCredentialDescriptorList: [],
      },
      {
        excludeCredentialDescriptorList: undefined,
      },
    ])(
      'No credential excluded with args.excludeCredentialDescriptorList $excludeCredentialDescriptorList',
      async ({ excludeCredentialDescriptorList }) => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          excludeCredentialDescriptorList,
        } as AuthenticatorMakeCredentialArgs;

        await performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          prisma,
          authenticatorMakeCredentialArgs,
        });
      },
    );
  });

  describe('args.hash', () => {
    test('Signature is valid', async () => {
      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        hash: CLIENT_DATA_HASH,
        attestationFormats: [Fmt.PACKED],
      };

      const { attestationObjectMap, parsedAuthenticatorData } =
        await performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          prisma,
          authenticatorMakeCredentialArgs,
        });

      const signature = attestationObjectMap.get('attStmt').get('sig');
      const signedData = new Uint8Array(
        Buffer.concat([attestationObjectMap.get('authData'), CLIENT_DATA_HASH]),
      );

      const isVerified = await verifySignature({
        credentialPublicKey: encodeCOSEPublicKey(
          parsedAuthenticatorData.credentialPublicKey!,
        ),
        data: signedData,
        signature: signature!,
      });

      expect(isVerified).toBe(true);
    });
  });

  describe('args.rpEntity', () => {
    test('Persists rpEntity values', async () => {
      const rpEntity = {
        id: 'custom.example.com',
        name: 'Custom RP',
      };

      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        rpEntity,
      };

      const { parsedAuthenticatorData } =
        await performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          prisma,
          authenticatorMakeCredentialArgs,
        });

      const webAuthnPublicKeyCredential =
        await prisma.webAuthnPublicKeyCredential.findUnique({
          where: {
            id: bytesToUuid(parsedAuthenticatorData.credentialID!),
          },
        });

      expect(webAuthnPublicKeyCredential?.rpId).toBe(rpEntity.id);
    });
  });

  describe('args.userEntity', () => {
    test('Persists userEntity values', async () => {
      const userHandle = new Uint8Array([11, 12, 13, 14]);

      const userEntity = {
        id: userHandle,
        name: 'custom-user',
        displayName: 'Custom User',
      };

      const authenticatorMakeCredentialArgs = {
        ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        userEntity,
      } as AuthenticatorMakeCredentialArgs;

      const { parsedAuthenticatorData } =
        await performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          prisma,
          authenticatorMakeCredentialArgs,
        });

      const webAuthnPublicKeyCredential =
        await prisma.webAuthnPublicKeyCredential.findUnique({
          where: {
            id: bytesToUuid(parsedAuthenticatorData.credentialID!),
          },
        });

      expect(webAuthnPublicKeyCredential?.userHandle).toStrictEqual(userHandle);
      expect(webAuthnPublicKeyCredential?.userName).toBe(userEntity.name);
      expect(webAuthnPublicKeyCredential?.userDisplayName).toBe(
        userEntity.displayName,
      );
    });
  });

  describe('meta.userId', () => {
    test.each([
      { userId: randomUUID() },
      { userId: 'NON_UUID' },
      { userId: (1234).toString() },
    ])(
      'Failes with userId that is not in the database or in invalid format: $userId',
      async ({ userId }) => {
        const meta: Partial<AuthenticatorMetaArgs> = {
          userId,
        };

        await expect(() =>
          performAuthenticatorMakeCredentialAndVerify({
            authenticator,
            prisma,
            authenticatorMakeCredentialArgs: AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
            meta,
          }),
        ).rejects.toThrowError(UserNotExists);
      },
    );
  });

  describe('state', () => {
    describe('Invalid UserPresence state', () => {
      test('Throws UserPresenceRequired when state is undefined and requireUserPresence is true', async () => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          requireUserPresence: true,
        } as AuthenticatorMakeCredentialArgs;

        await expect(() =>
          authenticator.authenticatorMakeCredential({
            authenticatorMakeCredentialArgs,
            meta: {
              userId: 'test-user',
              virtualAuthenticatorId: VIRTUAL_AUTHENTICATOR_ID,
              userPresenceEnabled: true,
              userVerificationEnabled: true,
              userVerificationType:
                VirtualAuthenticatorUserVerificationType.NONE,
              apiKeyId: null,
            },
            state: undefined,
          }),
        ).rejects.toThrowError(UserPresenceRequired);
      });

      test('Throws UserPresenceRequired when state.up is false', async () => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          requireUserPresence: true,
        } as AuthenticatorMakeCredentialArgs;

        const state: RegistrationState = {
          up: false,
        };

        await expect(() =>
          authenticator.authenticatorMakeCredential({
            authenticatorMakeCredentialArgs,
            meta: {
              userId: 'test-user',
              virtualAuthenticatorId: VIRTUAL_AUTHENTICATOR_ID,
              userPresenceEnabled: true,
              userVerificationEnabled: true,
              userVerificationType:
                VirtualAuthenticatorUserVerificationType.NONE,
              apiKeyId: null,
            },
            state,
          }),
        ).rejects.toThrowError(UserPresenceRequired);
      });

      test('Throws UserPresenceRequired with only uv in state but no up', async () => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          requireUserPresence: true,
          requireUserVerification: true,
        } as AuthenticatorMakeCredentialArgs;

        const state: RegistrationState = {
          uv: {},
        };

        await expect(() =>
          authenticator.authenticatorMakeCredential({
            authenticatorMakeCredentialArgs,
            meta: {
              userId: 'test-user',
              virtualAuthenticatorId: VIRTUAL_AUTHENTICATOR_ID,
              userPresenceEnabled: true,
              userVerificationEnabled: true,
              userVerificationType:
                VirtualAuthenticatorUserVerificationType.NONE,
              apiKeyId: null,
            },
            state,
          }),
        ).rejects.toThrowError(UserPresenceRequired);
      });
    });

    describe('Invalid UserVerification state', () => {
      test('Throws UserVerificationRequired when state.uv is undefined and requireUserVerification is true', async () => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          requireUserPresence: true,
          requireUserVerification: true,
        } as AuthenticatorMakeCredentialArgs;

        const state: RegistrationState = {
          up: true,
        };

        await expect(() =>
          authenticator.authenticatorMakeCredential({
            authenticatorMakeCredentialArgs,
            meta: {
              userId: 'test-user',
              virtualAuthenticatorId: VIRTUAL_AUTHENTICATOR_ID,
              userPresenceEnabled: true,
              userVerificationEnabled: true,
              userVerificationType:
                VirtualAuthenticatorUserVerificationType.NONE,
              apiKeyId: null,
            },
            state,
          }),
        ).rejects.toThrowError(UserVerificationRequired);
      });

      test('Throws UserVerificationRequired when state.uv is undefined (second test) and requireUserVerification is true', async () => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          requireUserPresence: true,
          requireUserVerification: true,
        } as AuthenticatorMakeCredentialArgs;

        const state: RegistrationState = {
          up: true,
        };

        await expect(() =>
          authenticator.authenticatorMakeCredential({
            authenticatorMakeCredentialArgs,
            meta: {
              userId: 'test-user',
              virtualAuthenticatorId: VIRTUAL_AUTHENTICATOR_ID,
              userPresenceEnabled: true,
              userVerificationEnabled: true,
              userVerificationType:
                VirtualAuthenticatorUserVerificationType.NONE,
              apiKeyId: null,
            },
            state,
          }),
        ).rejects.toThrowError(UserVerificationRequired);
      });
    });

    describe('Batch state (up and uv in one step)', () => {
      test('Succeeds when both up and uv are provided together and both are required', async () => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          requireUserPresence: true,
          requireUserVerification: true,
        } as AuthenticatorMakeCredentialArgs;

        const state: RegistrationState = {
          up: true,
          uv: {},
        };

        const { retries } = await performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          prisma,
          authenticatorMakeCredentialArgs,
          state,
        });

        expect(retries).toBe(0);
      });

      test('Succeeds when both up and uv are provided but only up is required', async () => {
        const authenticatorMakeCredentialArgs = {
          ...AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
          requireUserPresence: true,
          requireUserVerification: false,
        } as AuthenticatorMakeCredentialArgs;

        const state: RegistrationState = {
          up: true,
          uv: {},
        };

        const { retries } = await performAuthenticatorMakeCredentialAndVerify({
          authenticator,
          prisma,
          authenticatorMakeCredentialArgs,
          state,
        });

        expect(retries).toBe(0);
      });
    });
  });
});
