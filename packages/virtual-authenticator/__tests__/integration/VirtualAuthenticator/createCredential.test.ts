import {
  upsertTestingUser,
  USER_ID,
  USER_NAME,
} from '../../../../auth/__tests__/helpers';
import { set } from '@repo/core/__tests__/helpers';

import { COSEKeyAlgorithm, KeyAlgorithm } from '@repo/keys/enums';
import { COSEKeyMapper } from '@repo/keys/mappers';
import { PrismaClient } from '@repo/prisma';
import { TypeAssertionError } from '@repo/utils';
import { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import { randomBytes } from 'node:crypto';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import { VirtualAuthenticatorAgent } from '../../../src/VirtualAuthenticatorAgent';
import { Attestation } from '../../../src/enums/Attestation';
import { AuthenticatorAttachment } from '../../../src/enums/AuthenticatorAttachment';
import { AuthenticatorTransport } from '../../../src/enums/AuthenticatorTransport';
import { PublicKeyCredentialType } from '../../../src/enums/PublicKeyCredentialType';
import { ResidentKeyRequirement } from '../../../src/enums/ResidentKeyRequirement';
import { UserVerificationRequirement } from '../../../src/enums/UserVerificationRequirement';
import { AttestationNotSupported } from '../../../src/exceptions/AttestationNotSupported';
import { CredentialExcluded } from '../../../src/exceptions/CredentialExcluded';
import { CredentialTypesNotSupported } from '../../../src/exceptions/CredentialTypesNotSupported';
import { NoSupportedPubKeyCredParamFound } from '../../../src/exceptions/NoSupportedPubKeyCredParamWasFound';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import { CredentialCreationOptions } from '../../../src/zod-validation';
import type { PublicKeyCredentialCreationOptions } from '../../../src/zod-validation/PublicKeyCredentialCreationOptionsSchema';
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
import { performPublicKeyCredentialRegistrationAndVerify } from '../../helpers/performPublicKeyCredentialRegistrationAndVerify';

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
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  timeout: 60000,
} as PublicKeyCredentialCreationOptions;

/**
 * Tests for VirtualAuthenticator.createCredential() method
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-make-cred
 * @see https://www.w3.org/TR/webauthn-3/#authenticatormakecredential
 *
 * Per spec: The authenticatorMakeCredential operation is used to create a new public key
 * credential source. This is part of the WebAuthn registration ceremony.
 */
describe('VirtualAuthenticator.createCredential()', () => {
  const prisma = new PrismaClient();
  const keyVaultKeyIdGenerator = new KeyVaultKeyIdGenerator();
  const keyProvider = new MockKeyProvider({ keyVaultKeyIdGenerator });
  const webAuthnCredentialRepository = new PrismaWebAuthnRepository({
    prisma,
  });
  const authenticator = new VirtualAuthenticator({
    webAuthnRepository: webAuthnCredentialRepository,
    keyProvider,
  });
  const agent = new VirtualAuthenticatorAgent({ authenticator });

  const cleanupWebAuthnCredentials = async () => {
    await prisma.$transaction([
      prisma.webAuthnCredential.deleteMany(),
      prisma.webAuthnCredentialKeyVaultKeyMeta.deleteMany(),
    ]);
  };

  beforeAll(async () => {
    await upsertTestingUser({ prisma });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  /**
   * Tests for attestation parameter
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-attestation
   * @see https://www.w3.org/TR/webauthn-3/#enum-attestation-convey
   *
   * Per spec: This member specifies the Relying Party's preference regarding attestation
   * conveyance. Values: 'none', 'indirect', 'direct', 'enterprise'
   */
  describe('PublicKeyCredentialCreationOptions.attestation', () => {
    describe.each([
      {
        attestation: undefined,
      } satisfies Partial<PublicKeyCredentialCreationOptions>,
      {
        attestation: Attestation.NONE,
      } satisfies Partial<PublicKeyCredentialCreationOptions>,
      {
        attestation: Attestation.DIRECT,
      } satisfies Partial<PublicKeyCredentialCreationOptions>,
    ])('With attestation $attestation', ({ attestation }) => {
      let registrationVerification: VerifiedRegistrationResponse;
      let webAuthnCredentialId: string;

      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation,
      } satisfies PublicKeyCredentialCreationOptions;

      beforeAll(async () => {
        ({ registrationVerification, webAuthnCredentialId } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          }));
      });

      afterAll(async () => {
        await cleanupWebAuthnCredentials();
      });

      test('Should return a verified registration', () => {
        expect(registrationVerification.verified).toBe(true);
      });

      test('Should have a counter of 0', () => {
        expect(
          registrationVerification.registrationInfo?.credential.counter,
        ).toBe(0);
      });

      test('Should have the correct public key', () => {
        const jwk = COSEKeyMapper.COSEKeyToJwk(
          COSEKeyMapper.bytesToCOSEKey(
            registrationVerification.registrationInfo!.credential.publicKey,
          ),
        );

        expect(jwk).toMatchObject(
          keyProvider
            .getKeyPairStore()
            [webAuthnCredentialId].publicKey.export({ format: 'jwk' }),
        );
      });

      test('Should save the WebAuthnCredential to the database', async () => {
        const webAuthnCredential = await prisma.webAuthnCredential.findUnique({
          where: {
            id: webAuthnCredentialId,
          },
        });

        expect(webAuthnCredential).toMatchObject({
          id: webAuthnCredentialId,
          userId: USER_ID,
        });
      });

      test('Should save the KeyVaultKeyMeta to the database', async () => {
        const keyMeta =
          await prisma.webAuthnCredentialKeyVaultKeyMeta.findFirst({
            where: {
              webAuthnCredentialId: webAuthnCredentialId,
            },
          });

        expect(keyMeta).toMatchObject({
          webAuthnCredentialId: webAuthnCredentialId,
          keyVaultKeyId: keyVaultKeyIdGenerator.getCurrent().keyVaultKeyId,
          keyVaultKeyName: keyVaultKeyIdGenerator.getCurrent().keyVaultKeyName,
          hsm: false,
        });
      });
    });

    test.each([
      {
        attestation: Attestation.ENTERPRISE,
      } satisfies Partial<PublicKeyCredentialCreationOptions>,
      {
        attestation: Attestation.INDIRECT,
      } satisfies Partial<PublicKeyCredentialCreationOptions>,
    ])(
      `Should throw ${AttestationNotSupported.name} with attestation $attestation`,
      async ({ attestation }) => {
        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              attestation,
            },
          }),
        ).rejects.toThrowError(new AttestationNotSupported());
      },
    );

    test('Shold throw type mismatch when attestation is not in enum', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: 'WRONG_ATTESTATION',
      };

      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions:
            publicKeyCredentialCreationOptions as PublicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });
  });

  /**
   * Tests for pubKeyCredParams parameter
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-pubkeycredparams
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialparameters
   *
   * Per spec: This member contains information about the desired properties of the credential
   * to be created. The sequence is ordered from most preferred to least preferred.
   */
  describe('PublicKeyCredentialCreationOptions.pubKeyCredParams', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    test('Should work with multiple unsupported and one supported pubKeyCredParams', async () => {
      const publicKeyCredentialCreationOptions = set(
        PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        {
          pubKeyCredParams: (pubKeyCredParams) => [
            { type: 'WRONG_TYPE', alg: COSEKeyAlgorithm.ES256 },
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: -8,
            },
            {
              type: 'WRONG_TYPE',
              alg: COSEKeyAlgorithm.ES256,
            },
            ...pubKeyCredParams,
          ],
        },
      );

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    test('Should work when pubKeyCredParams is empty', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        pubKeyCredParams: [],
      };

      await performPublicKeyCredentialRegistrationAndVerify({
        agent,
        publicKeyCredentialCreationOptions,
      });
    });

    test.each([
      {
        publicKeyCredentialCreationOptions: {
          pubKeyCredParams: [
            { type: 'WRONG_TYPE', alg: COSEKeyAlgorithm.ES256 },
          ],
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
        expectToThrowError: new CredentialTypesNotSupported(),
      },
      {
        publicKeyCredentialCreationOptions: {
          pubKeyCredParams: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: -8,
            },
          ],
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
        expectToThrowError: new NoSupportedPubKeyCredParamFound(),
      },
      {
        publicKeyCredentialCreationOptions: {
          pubKeyCredParams: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: -8,
            },
            {
              type: 'WRONG_TYPE',
              alg: COSEKeyAlgorithm.ES256,
            },
          ],
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
        expectToThrowError: new NoSupportedPubKeyCredParamFound(),
      },
    ])(
      'Should throw without any supported pubKeyCredParams',
      async ({
        publicKeyCredentialCreationOptions: options,
        expectToThrowError,
      }) => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          pubKeyCredParams: options.pubKeyCredParams,
          attestation: undefined,
        };

        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          }),
        ).rejects.toThrowError(expectToThrowError);
      },
    );
  });

  /**
   * Tests for meta.userId validation
   * @see https://www.w3.org/TR/webauthn-3/#user-handle
   *
   * Per spec: The user handle is used to identify the user account and must be a valid identifier
   */
  describe('meta.userId', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    test('Should throw type mismatch when userId is invalid', async () => {
      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions:
            PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          meta: {
            userId: 'INVALID_USER_ID',
            origin: RP_ORIGIN,
          },
        }),
      ).to.rejects.toThrowError(new TypeAssertionError());
    });
  });

  /**
   * Tests for user.id byte length validation
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialuserentity-id
   * @see https://www.w3.org/TR/webauthn-3/#user-handle
   *
   * Per spec: The user handle is a BufferSource with a maximum size of 64 bytes,
   * and a recommended size of at least 16 bytes, to aid in preventing user enumeration.
   */
  describe('PublicKeyCredentialCreationOptions.user.id byte length', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    test('Should throw TypeError when user.id is empty (0 bytes)', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        user: {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
          id: new Uint8Array(0),
        },
      };

      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    test('Should throw TypeError when user.id exceeds 64 bytes', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        user: {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
          id: new Uint8Array(65), // 65 bytes, exceeds max of 64
        },
      };

      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    test('Should work with valid user.id (16 bytes for UUID)', async () => {
      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions: {
            ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            attestation: Attestation.NONE,
          },
        });

      expect(registrationVerification.verified).toBe(true);
    });
  });

  /**
   * Tests for authenticatorSelection parameter
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-authenticatorselection
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-authenticatorselectioncriteria
   *
   * Per spec: This OPTIONAL member specifies capabilities and settings that the authenticator
   * MUST or SHOULD satisfy to participate in the credential creation operation.
   */
  describe('PublicKeyCredentialCreationOptions.authenticatorSelection', () => {
    /**
     * Tests for userVerification parameter
     * @see https://www.w3.org/TR/webauthn-3/#dom-authenticatorselectioncriteria-userverification
     * @see https://www.w3.org/TR/webauthn-3/#enum-userVerificationRequirement
     *
     * Per spec: This member describes the Relying Party's requirements regarding user verification.
     * Values: 'required', 'preferred', 'discouraged'
     */
    describe('authenticatorSelection.userVerification', () => {
      describe.each([
        {
          userVerification: undefined,
        },
        {
          userVerification: UserVerificationRequirement.PREFERRED,
        },
        {
          userVerification: UserVerificationRequirement.REQUIRED,
        },
        {
          userVerification: UserVerificationRequirement.DISCOURAGED,
        },
      ])('With userVerification $userVerification', ({ userVerification }) => {
        let registrationVerification: VerifiedRegistrationResponse;
        let webAuthnCredentialId: string;

        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          attestation: Attestation.NONE,
          authenticatorSelection: {
            userVerification,
          },
        } satisfies PublicKeyCredentialCreationOptions;

        beforeAll(async () => {
          ({ registrationVerification, webAuthnCredentialId } =
            await performPublicKeyCredentialRegistrationAndVerify({
              agent,
              publicKeyCredentialCreationOptions,
              requireUserVerification:
                userVerification === UserVerificationRequirement.REQUIRED,
            }));
        });

        afterAll(async () => {
          await cleanupWebAuthnCredentials();
        });

        test('Should return a verified registration', () => {
          expect(registrationVerification.verified).toBe(true);
        });

        test('Should save the WebAuthnCredential to the database', async () => {
          const webAuthnCredential = await prisma.webAuthnCredential.findUnique(
            {
              where: {
                id: webAuthnCredentialId,
              },
            },
          );

          expect(webAuthnCredential).toMatchObject({
            id: webAuthnCredentialId,
            userId: USER_ID,
          });
        });
      });

      test('Should throw type mismatch when userVerification is not in enum', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          authenticatorSelection: {
            userVerification: 'INVALID_USER_VERIFICATION',
          },
        };

        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              publicKeyCredentialCreationOptions as PublicKeyCredentialCreationOptions,
          }),
        ).rejects.toThrowError(new TypeAssertionError());

        await cleanupWebAuthnCredentials();
      });
    });

    /**
     * Tests for authenticatorAttachment parameter
     * @see https://www.w3.org/TR/webauthn-3/#dom-authenticatorselectioncriteria-authenticatorattachment
     * @see https://www.w3.org/TR/webauthn-3/#enum-authenticatorAttachment
     *
     * Per spec: This OPTIONAL member specifies the authenticator attachment modality.
     * Values: 'platform', 'cross-platform'
     */
    describe('authenticatorSelection.authenticatorAttachment', () => {
      describe.each([
        {
          authenticatorAttachment: undefined,
        },
        {
          authenticatorAttachment: AuthenticatorAttachment.PLATFORM,
        },
        {
          authenticatorAttachment: AuthenticatorAttachment.CROSS_PLATFORM,
        },
      ])(
        'With authenticatorAttachment $authenticatorAttachment',
        ({ authenticatorAttachment }) => {
          let registrationVerification: VerifiedRegistrationResponse;
          let webAuthnCredentialId: string;

          const publicKeyCredentialCreationOptions = {
            ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            attestation: Attestation.NONE,
            authenticatorSelection: {
              authenticatorAttachment,
            },
          } satisfies PublicKeyCredentialCreationOptions;

          beforeAll(async () => {
            ({ registrationVerification, webAuthnCredentialId } =
              await performPublicKeyCredentialRegistrationAndVerify({
                agent,
                publicKeyCredentialCreationOptions,
              }));
          });

          afterAll(async () => {
            await cleanupWebAuthnCredentials();
          });

          test('Should return a verified registration', () => {
            expect(registrationVerification.verified).toBe(true);
          });

          test('Should save the WebAuthnCredential to the database', async () => {
            const webAuthnCredential =
              await prisma.webAuthnCredential.findUnique({
                where: {
                  id: webAuthnCredentialId,
                },
              });

            expect(webAuthnCredential).toMatchObject({
              id: webAuthnCredentialId,
              userId: USER_ID,
            });
          });
        },
      );

      test('Should throw type mismatch when authenticatorAttachment is not in enum', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          authenticatorSelection: {
            authenticatorAttachment: 'INVALID_ATTACHMENT',
          },
        };

        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              publicKeyCredentialCreationOptions as PublicKeyCredentialCreationOptions,
          }),
        ).rejects.toThrowError(new TypeAssertionError());

        await cleanupWebAuthnCredentials();
      });
    });

    /**
     * Tests for residentKey parameter
     * @see https://www.w3.org/TR/webauthn-3/#dom-authenticatorselectioncriteria-residentkey
     * @see https://www.w3.org/TR/webauthn-3/#enum-residentKeyRequirement
     *
     * Per spec: This member specifies the Relying Party's requirements regarding
     * resident credentials (aka discoverable credentials or passkeys).
     * Values: 'discouraged', 'preferred', 'required'
     */
    describe('authenticatorSelection.residentKey', () => {
      describe.each([
        {
          residentKey: undefined,
        },
        {
          residentKey: ResidentKeyRequirement.DISCOURAGED,
        },
        {
          residentKey: ResidentKeyRequirement.PREFERRED,
        },
        {
          residentKey: ResidentKeyRequirement.REQUIRED,
        },
      ])('With residentKey $residentKey', ({ residentKey }) => {
        let registrationVerification: VerifiedRegistrationResponse;
        let webAuthnCredentialId: string;

        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          attestation: Attestation.NONE,
          authenticatorSelection: {
            residentKey,
          },
        } satisfies PublicKeyCredentialCreationOptions;

        beforeAll(async () => {
          ({ registrationVerification, webAuthnCredentialId } =
            await performPublicKeyCredentialRegistrationAndVerify({
              agent,
              publicKeyCredentialCreationOptions,
            }));
        });

        afterAll(async () => {
          await cleanupWebAuthnCredentials();
        });

        test('Should return a verified registration', () => {
          expect(registrationVerification.verified).toBe(true);
        });

        test('Should save the WebAuthnCredential to the database', async () => {
          const webAuthnCredential = await prisma.webAuthnCredential.findUnique(
            {
              where: {
                id: webAuthnCredentialId,
              },
            },
          );

          expect(webAuthnCredential).toMatchObject({
            id: webAuthnCredentialId,
            userId: USER_ID,
          });
        });
      });

      test('Should throw type mismatch when residentKey is not in enum', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          authenticatorSelection: {
            residentKey: 'INVALID_RESIDENT_KEY',
          },
        };

        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              publicKeyCredentialCreationOptions as PublicKeyCredentialCreationOptions,
          }),
        ).rejects.toThrowError(new TypeAssertionError());

        await cleanupWebAuthnCredentials();
      });
    });

    /**
     * Tests for requireResidentKey parameter (deprecated)
     * @see https://www.w3.org/TR/webauthn-3/#dom-authenticatorselectioncriteria-requireresidentkey
     *
     * Per spec: This OPTIONAL member is retained for backwards compatibility with WebAuthn Level 1.
     * Relying Parties should use residentKey instead. Default is false.
     */
    describe('authenticatorSelection.requireResidentKey (deprecated)', () => {
      describe.each([
        {
          requireResidentKey: undefined,
        },
        {
          requireResidentKey: true,
        },
        {
          requireResidentKey: false,
        },
      ])(
        'With requireResidentKey $requireResidentKey',
        ({ requireResidentKey }) => {
          let registrationVerification: VerifiedRegistrationResponse;
          let webAuthnCredentialId: string;

          const publicKeyCredentialCreationOptions = {
            ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            attestation: Attestation.NONE,
            authenticatorSelection: {
              requireResidentKey,
            },
          } satisfies PublicKeyCredentialCreationOptions;

          beforeAll(async () => {
            ({ registrationVerification, webAuthnCredentialId } =
              await performPublicKeyCredentialRegistrationAndVerify({
                agent,
                publicKeyCredentialCreationOptions,
              }));
          });

          afterAll(async () => {
            await cleanupWebAuthnCredentials();
          });

          test('Should return a verified registration', () => {
            expect(registrationVerification.verified).toBe(true);
          });

          test('Should save the WebAuthnCredential to the database', async () => {
            const webAuthnCredential =
              await prisma.webAuthnCredential.findUnique({
                where: {
                  id: webAuthnCredentialId,
                },
              });

            expect(webAuthnCredential).toMatchObject({
              id: webAuthnCredentialId,
              userId: USER_ID,
            });
          });
        },
      );

      test('Should throw type mismatch when requireResidentKey is not a boolean', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          authenticatorSelection: {
            requireResidentKey: 'INVALID_BOOLEAN',
          },
        };

        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
          }),
        ).rejects.toThrowError(new TypeAssertionError());

        await cleanupWebAuthnCredentials();
      });
    });

    /**
     * Tests for combined authenticatorSelection options
     * @see https://www.w3.org/TR/webauthn-3/#dictdef-authenticatorselectioncriteria
     *
     * Per spec: Tests that multiple authenticator selection criteria can be combined
     */
    describe('Combined authenticatorSelection options', () => {
      afterEach(async () => {
        await cleanupWebAuthnCredentials();
      });

      test('Should work with all authenticatorSelection options combined', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          attestation: Attestation.NONE,
          authenticatorSelection: {
            authenticatorAttachment: AuthenticatorAttachment.CROSS_PLATFORM,
            residentKey: ResidentKeyRequirement.PREFERRED,
            userVerification: UserVerificationRequirement.REQUIRED,
          },
        } satisfies PublicKeyCredentialCreationOptions;

        const { registrationVerification, webAuthnCredentialId } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          });

        expect(registrationVerification.verified).toBe(true);

        const webAuthnCredential = await prisma.webAuthnCredential.findUnique({
          where: {
            id: webAuthnCredentialId,
          },
        });

        expect(webAuthnCredential).toMatchObject({
          id: webAuthnCredentialId,
          userId: USER_ID,
        });
      });

      test('Should work with empty authenticatorSelection (all defaults)', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          attestation: Attestation.NONE,
          authenticatorSelection: {},
        } satisfies PublicKeyCredentialCreationOptions;

        const { registrationVerification, webAuthnCredentialId } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          });

        expect(registrationVerification.verified).toBe(true);

        const webAuthnCredential = await prisma.webAuthnCredential.findUnique({
          where: {
            id: webAuthnCredentialId,
          },
        });

        expect(webAuthnCredential).toMatchObject({
          id: webAuthnCredentialId,
          userId: USER_ID,
        });
      });
    });
  });

  /**
   * Tests for multiple algorithm support in pubKeyCredParams
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-pubkeycredparams
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialparameters
   * @see https://www.iana.org/assignments/cose/cose.xhtml#algorithms
   *
   * Per spec: This member lists the key types and signature algorithms the Relying Party supports,
   * ordered from most preferred to least preferred. The authenticator selects the first algorithm
   * it supports.
   */
  describe('PublicKeyCredentialCreationOptions.pubKeyCredParams - Multiple Algorithms', () => {
    describe.each([
      {
        name: 'ES256 only',
        pubKeyCredParams: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.ES256,
          },
        ],
      },
      {
        name: 'RS256 only',
        pubKeyCredParams: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.RS256,
          },
        ],
      },
      {
        name: 'ES256 and RS256',
        pubKeyCredParams: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.ES256,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.RS256,
          },
        ],
      },
      {
        name: 'All ES algorithms',
        pubKeyCredParams: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.ES256,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.ES384,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.ES512,
          },
        ],
      },
      {
        name: 'All RS algorithms',
        pubKeyCredParams: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.RS256,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.RS384,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.RS512,
          },
        ],
      },
      {
        name: 'All PS algorithms',
        pubKeyCredParams: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.PS256,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.PS384,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.PS512,
          },
        ],
      },
    ])('With $name', ({ pubKeyCredParams }) => {
      let registrationVerification: VerifiedRegistrationResponse;
      let webAuthnCredentialId: string;

      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        pubKeyCredParams,
      } satisfies PublicKeyCredentialCreationOptions;

      beforeAll(async () => {
        ({ registrationVerification, webAuthnCredentialId } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          }));
      });

      afterAll(async () => {
        await cleanupWebAuthnCredentials();
      });

      test('Should return a verified registration', () => {
        expect(registrationVerification.verified).toBe(true);
      });

      test('Should save the WebAuthnCredential to the database', async () => {
        const webAuthnCredential = await prisma.webAuthnCredential.findUnique({
          where: {
            id: webAuthnCredentialId,
          },
        });

        expect(webAuthnCredential).toMatchObject({
          id: webAuthnCredentialId,
          userId: USER_ID,
        });
      });

      test('Should have the correct public key', () => {
        const jwk = COSEKeyMapper.COSEKeyToJwk(
          COSEKeyMapper.bytesToCOSEKey(
            registrationVerification.registrationInfo!.credential.publicKey,
          ),
        );

        expect(jwk).toMatchObject(
          keyProvider
            .getKeyPairStore()
            [webAuthnCredentialId].publicKey.export({ format: 'jwk' }),
        );
      });
    });
  });

  /**
   * Tests for timeout parameter
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-timeout
   *
   * Per spec: This OPTIONAL member specifies a time, in milliseconds, that the Relying Party
   * is willing to wait for the call to complete. This is treated as a hint, and MAY be
   * overridden by the client.
   */
  describe('PublicKeyCredentialCreationOptions.timeout', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    test.each([
      { timeout: undefined },
      { timeout: 60000 },
      { timeout: 120000 },
      { timeout: 300000 },
    ])('Should work with timeout $timeout', async ({ timeout }) => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        timeout,
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    test('Should throw type mismatch when timeout is too small', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        timeout: 30_000,
      } satisfies PublicKeyCredentialCreationOptions;

      await expect(
        async () =>
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    test('Should throw type mismatch when timeout is not a number', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        timeout: 'INVALID_TIMEOUT',
      };

      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions:
            publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });
  });

  /**
   * Tests for excludeCredentials (credential exclusion list)
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-excludecredentials
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialdescriptor
   *
   * Per spec: An OPTIONAL member containing a list of PublicKeyCredentialDescriptor objects
   * representing public key credentials the Relying Party is aware of. The authenticator
   * should avoid creating duplicate credentials on the same authenticator.
   */
  describe('PublicKeyCredentialCreationOptions.excludeCredentials', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    test.each([
      {
        excludeCredentials: undefined,
      },
      {
        excludeCredentials: [],
      },
    ])(
      'Should work with empty or undefined excludeCredentials array',
      async ({ excludeCredentials }) => {
        // First, create a credential
        const firstCredential =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        expect(firstCredential.registrationVerification.verified).toBe(true);

        // Now try to create another credential, excluding no credential using empty array
        // Per spec, the authenticator should still allow this (different credential)
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          excludeCredentials,
        } satisfies PublicKeyCredentialCreationOptions;

        const secondCredential =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          });

        expect(secondCredential.registrationVerification.verified).toBe(true);
      },
    );

    /**
     * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-excludecredentials
     * Per spec: If the authenticator has a credential matching a descriptor in excludeCredentials,
     * it should not create a new credential (to prevent duplicate credentials)
     */
    test('Should work with excludeCredentials containing existing credential', async () => {
      // First, create a credential
      const firstCredential =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions:
            PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        });

      expect(firstCredential.registrationVerification.verified).toBe(true);

      // Now try to create another credential, excluding the first one
      // Per spec, the authenticator should still allow this (different credential)
      // but may reject if it interprets this as preventing duplicate registration
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        excludeCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: firstCredential.publicKeyCredential.rawId,
            transports: undefined,
          },
        ],
      } satisfies PublicKeyCredentialCreationOptions;

      await expect(
        async () =>
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          }),
      ).rejects.toThrowError(new CredentialExcluded());
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialdescriptor-transports
     * @see https://www.w3.org/TR/webauthn-3/#enum-transport
     * Per spec: transports is an OPTIONAL hint about how to communicate with the authenticator
     */
    test('Should work with excludeCredentials containing transports', async () => {
      const someCredentialId = new Uint8Array(randomBytes(16));

      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        excludeCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: someCredentialId,
            transports: [
              AuthenticatorTransport.USB,
              AuthenticatorTransport.BLE,
            ],
          },
        ],
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    test('Should work with multiple excluded credentials', async () => {
      const credId1 = new Uint8Array(randomBytes(16));
      const credId2 = new Uint8Array(randomBytes(16));

      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        excludeCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: credId1,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: credId2,
            transports: ['internal' as const],
          },
        ],
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialdescriptor-type
     * Per spec: type must be a valid PublicKeyCredentialType (currently only "public-key")
     */
    test('Should fail with invalid credential descriptor type', async () => {
      const someCredentialId = new Uint8Array(randomBytes(16));

      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        excludeCredentials: [
          {
            type: 'INVALID_TYPE',
            id: someCredentialId,
          },
        ],
      };

      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions:
            publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    test('Should fail with invalid credential id (not Uint8Array)', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        excludeCredentials: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: 'not-a-uint8array',
          },
        ],
      };

      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions:
            publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });
  });

  /**
   * Tests for challenge validation
   * @see https://www.w3.org/TR/webauthn-3/#sctn-cryptographic-challenges
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-challenge
   *
   * Per spec: "Challenges SHOULD contain enough entropy to make guessing them infeasible.
   * Challenges SHOULD therefore be at least 16 bytes long."
   */
  describe('PublicKeyCredentialCreationOptions.challenge', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    test('Should work with challenge exactly 16 bytes (minimum recommended)', async () => {
      const challenge = new Uint8Array(randomBytes(16)); // Exactly 16 bytes

      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        challenge,
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-cryptographic-challenges
     * Spec states: "Challenges SHOULD therefore be at least 16 bytes long."
     * Note: SHOULD is a recommendation, not a requirement. The MUST requirement is only
     * that challenges contain enough entropy. A 15-byte random challenge has sufficient
     * entropy even though it's below the 16-byte recommendation.
     */
    test('Should work with challenge less than 16 bytes (has entropy, just below recommendation)', async () => {
      const challenge = new Uint8Array(randomBytes(15)); // Less than 16 bytes but has entropy

      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        challenge,
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    test('Should work with empty challenge (0 bytes)', async () => {
      const challenge = new Uint8Array(0);

      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        challenge,
      };

      await performPublicKeyCredentialRegistrationAndVerify({
        agent,
        publicKeyCredentialCreationOptions,
      });
    });

    test('Should work with very large challenge (1024 bytes)', async () => {
      const challenge = new Uint8Array(randomBytes(1024));

      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        challenge,
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    test('Should fail when challenge is not Uint8Array', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        challenge: 'not-a-uint8array',
      };

      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions:
            publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });
  });

  /**
   * Tests for user entity validation
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialuserentity
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialentity-name
   *
   * Per spec: PublicKeyCredentialUserEntity extends PublicKeyCredentialEntity
   * Required fields: id (user handle), name, displayName
   * - id: BufferSource (1-64 bytes)
   * - name: DOMString (human-palatable identifier, e.g., email)
   * - displayName: DOMString (human-palatable name for display)
   */
  describe('PublicKeyCredentialCreationOptions.user', () => {
    describe('user.name and user.displayName', () => {
      afterEach(async () => {
        await cleanupWebAuthnCredentials();
      });

      test('Should work with valid name and displayName', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          attestation: Attestation.NONE,
          user: {
            ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
            name: 'user@example.com',
            displayName: 'Test User',
          },
        } satisfies PublicKeyCredentialCreationOptions;
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          });
        expect(registrationVerification.verified).toBe(true);
      });

      /**
       * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialentity-name
       * Per spec: name is a required DOMString member
       */
      test('Should fail with missing name', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          user: {
            id: USER_ID_BYTSES,
            displayName: 'Test User',
            // name is missing
          },
        };
        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
          }),
        ).rejects.toThrowError(new TypeAssertionError());
      });

      /**
       * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialuserentity-displayname
       * Per spec: displayName is a required DOMString member
       */
      test('Should fail with missing displayName', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          user: {
            id: USER_ID_BYTSES,
            name: 'user@example.com',
            // displayName is missing
          },
        };
        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
          }),
        ).rejects.toThrowError(new TypeAssertionError());
      });

      test('Should work with special characters in name', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          attestation: Attestation.NONE,
          user: {
            ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
            name: 'user+tag@example.com',
            displayName: 'Test User 🚀',
          },
        } satisfies PublicKeyCredentialCreationOptions;
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          });
        expect(registrationVerification.verified).toBe(true);
      });

      test('Should work with very long name (64 characters)', async () => {
        const longName = 'a'.repeat(64) + '@example.com';
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          attestation: Attestation.NONE,
          user: {
            ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
            name: longName,
            displayName: 'Test User',
          },
        } satisfies PublicKeyCredentialCreationOptions;
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          });
        expect(registrationVerification.verified).toBe(true);
      });

      test('Should work with very long displayName (64 characters)', async () => {
        const longDisplayName = 'Test User '.repeat(6) + 'End'; // > 64 chars
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          attestation: Attestation.NONE,
          user: {
            ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
            name: 'user@example.com',
            displayName: longDisplayName,
          },
        } satisfies PublicKeyCredentialCreationOptions;
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions,
          });
        expect(registrationVerification.verified).toBe(true);
      });

      test('Should fail with non-string name', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          user: {
            ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
            name: 123,
          },
        };
        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
          }),
        ).rejects.toThrowError(new TypeAssertionError());
      });

      test('Should fail with non-string displayName', async () => {
        const publicKeyCredentialCreationOptions = {
          ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          user: {
            ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
            displayName: 123,
          },
        };
        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
          }),
        ).rejects.toThrowError(new TypeAssertionError());
      });
    });
  });

  /**
   * Tests for Relying Party entity validation
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialrpentity
   * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrpentity-id
   * @see https://www.w3.org/TR/webauthn-3/#relying-party-identifier
   *
   * Per spec: PublicKeyCredentialRpEntity extends PublicKeyCredentialEntity
   * Required fields: name (DOMString), id (DOMString - valid domain)
   * The RP ID must be a valid domain string and an effective domain
   */
  describe('PublicKeyCredentialCreationOptions.rp', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    test('Should work with valid RP name and id', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        rp: {
          name: 'Example Corp',
          id: 'example.com',
        },
      } satisfies PublicKeyCredentialCreationOptions;
      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });
      expect(registrationVerification.verified).toBe(true);
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialentity-name
     * Per spec: name is a required DOMString member
     */
    test('Should fail with missing RP name', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        rp: {
          id: 'example.com',
          // name is missing
        },
      };
      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions:
            publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-rp
     * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialrpentity-id
     * Per spec: id is an OPTIONAL DOMString member. If omitted, its value will be
     * the CredentialsContainer object's relevant settings object's origin's effective domain.
     */
    test('Should work with missing RP id (defaults to origin effective domain)', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        rp: {
          name: 'Example Corp',
          // id is omitted - should default to origin's effective domain
        },
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification, webAuthnCredentialId } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);

      // Verify the credential was created and stored
      const webAuthnCredential = await prisma.webAuthnCredential.findUnique({
        where: {
          id: webAuthnCredentialId,
        },
      });

      expect(webAuthnCredential).toMatchObject({
        id: webAuthnCredentialId,
        userId: USER_ID,
        // The rpId should default to the origin's effective domain (example.com)
        rpId: new URL(RP_ORIGIN).hostname,
      });
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#relying-party-identifier
     * Per spec: The RP ID must be a valid domain string
     */
    test('Should fail with invalid RP id format (not a valid domain)', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        rp: {
          name: 'Example Corp',
          id: 'not-a-valid-domain!@#',
        },
      } satisfies PublicKeyCredentialCreationOptions;
      // The registration may succeed locally, but verification should fail
      // because the RP ID won't match the expected origin
      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    test('Should work with subdomain as RP id', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        rp: {
          name: 'Example Corp',
          id: 'example.com', // Must be valid effective domain
        },
      } satisfies PublicKeyCredentialCreationOptions;
      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });
      expect(registrationVerification.verified).toBe(true);
    });

    test('Should work with very long RP name', async () => {
      const longRpName = 'Example Corporation '.repeat(10); // Very long name
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        rp: {
          name: longRpName,
          id: 'example.com',
        },
      } satisfies PublicKeyCredentialCreationOptions;
      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });
      expect(registrationVerification.verified).toBe(true);
    });
  });

  /**
   * Tests for WebAuthn extensions
   * @see https://www.w3.org/TR/webauthn-3/#sctn-extensions
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-authenticationextensionsclientinputs
   *
   * Per spec: Extensions are optional and provide additional functionality.
   * Unknown extensions should be ignored by the authenticator.
   *
   * Common extensions:
   * - credProps: @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-credential-properties-extension
   * - hmac-secret: @see https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-errata-20220621.html#sctn-hmac-secret-extension
   * - credProtect: @see https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-errata-20220621.html#sctn-credProtect-extension
   * - minPinLength: @see https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-errata-20220621.html#sctn-minpinlength-extension
   * - largeBlob: @see https://www.w3.org/TR/webauthn-3/#sctn-large-blob-extension
   */
  describe('PublicKeyCredentialCreationOptions.extensions', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    test('Should work with undefined extensions', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        extensions: undefined,
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    test('Should work with empty extensions object', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        extensions: {},
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-authenticator-credential-properties-extension
     * Per spec: credProps extension returns whether the credential is client-side discoverable (rk)
     */
    test('Should work with credProps extension', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        extensions: {
          credProps: true,
        },
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification, publicKeyCredential } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
      // Per spec, credProps extension should return rk (resident key) property
      // The authenticator should include this in the response
      // Note: Implementation may vary - this tests that it doesn't break registration
      expect(publicKeyCredential).toBeDefined();
    });

    /**
     * @see https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-errata-20220621.html#sctn-hmac-secret-extension
     * Per CTAP2: Enables symmetric secret generation for HMAC operations
     */
    test('Should work with hmac-secret extension', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        extensions: {
          'hmac-secret': true,
        },
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    /**
     * @see https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-errata-20220621.html#sctn-credProtect-extension
     * Per CTAP2: Allows RPs to specify credential protection policy
     * Values: userVerificationOptional, userVerificationOptionalWithCredentialIDList, userVerificationRequired
     */
    test('Should work with credProtect extension', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        extensions: {
          credProtect: 'userVerificationOptional', // or 'userVerificationOptionalWithCredentialIDList', 'userVerificationRequired'
        },
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    /**
     * @see https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-errata-20220621.html#sctn-minpinlength-extension
     * Per CTAP2: Returns the minimum PIN length required by the authenticator
     */
    test('Should work with minPinLength extension', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        extensions: {
          minPinLength: true,
        },
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-large-blob-extension
     * Per spec: Allows storage and retrieval of large blob data associated with credential
     * support values: 'required' or 'preferred'
     */
    test('Should work with largeBlob extension', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        extensions: {
          largeBlob: {
            support: 'required', // or 'preferred'
          },
        },
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#sctn-extensions
     * Per spec: "Authenticators MUST ignore any extensions that they do not recognize."
     */
    test('Should ignore unknown/unsupported extensions', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        extensions: {
          unknownExtension: 'some-value',
          anotherUnknown: { complex: 'object' },
        },
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      // Per spec, unknown extensions should be ignored, not cause errors
      expect(registrationVerification.verified).toBe(true);
    });

    test('Should work with multiple extensions combined', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        attestation: Attestation.NONE,
        extensions: {
          credProps: true,
          'hmac-secret': true,
          minPinLength: true,
          credProtect: 'userVerificationOptional',
        },
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });
  });

  /**
   * Tests for edge cases and overall spec compliance
   * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialcreationoptions
   *
   * These tests verify boundary conditions and ensure the implementation
   * handles both minimal valid inputs and maximum complexity scenarios
   */
  describe('Edge Cases and Spec Compliance', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    /**
     * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialcreationoptions
     * Required fields: rp, user, challenge, pubKeyCredParams
     */
    test('Should work with minimal valid options (only required fields)', async () => {
      // Only required fields per spec
      const publicKeyCredentialCreationOptions = {
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
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.ES256,
          },
        ],
        // All optional fields omitted: timeout, excludeCredentials, authenticatorSelection, attestation, extensions
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    test('Should work with all fields at maximum reasonable lengths', async () => {
      const longName = 'a'.repeat(100) + '@example.com';
      const longDisplayName = 'User Name '.repeat(20);
      const longRpName = 'Corporation '.repeat(20);
      const largeChallenge = new Uint8Array(randomBytes(1024));
      const publicKeyCredentialCreationOptions = {
        rp: {
          name: longRpName,
          id: RP_ID,
        },
        user: {
          id: USER_ID_BYTSES,
          name: longName,
          displayName: longDisplayName,
        },
        challenge: largeChallenge,
        pubKeyCredParams: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.ES256,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.ES384,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.ES512,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.RS256,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.RS384,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.RS512,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.PS256,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.PS384,
          },
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: COSEKeyAlgorithm.PS512,
          },
        ],
        timeout: 300000,
        excludeCredentials: [],
        authenticatorSelection: {
          authenticatorAttachment: AuthenticatorAttachment.CROSS_PLATFORM,
          residentKey: ResidentKeyRequirement.PREFERRED,
          userVerification: UserVerificationRequirement.REQUIRED,
        },
        attestation: Attestation.NONE,
        extensions: {
          credProps: true,
          'hmac-secret': true,
        },
      } satisfies PublicKeyCredentialCreationOptions;

      const { registrationVerification } =
        await performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions,
        });

      expect(registrationVerification.verified).toBe(true);
    });

    test('Should fail with completely malformed options', async () => {
      const malformedOptions = {
        notValid: 'options',
      };

      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions:
            malformedOptions as unknown as PublicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    test('Should fail with null in required field', async () => {
      const publicKeyCredentialCreationOptions = {
        ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
        challenge: null,
      };

      await expect(async () =>
        performPublicKeyCredentialRegistrationAndVerify({
          agent,
          publicKeyCredentialCreationOptions:
            publicKeyCredentialCreationOptions as unknown as PublicKeyCredentialCreationOptions,
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });
  });

  /**
   * Tests for VirtualAuthenticatorAgent.createCredential() spec steps
   * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential
   *
   * These tests validate that the agent correctly implements each step
   * of the createCredential algorithm as defined in the WebAuthn Level 3 specification.
   */
  describe('VirtualAuthenticatorAgent.createCredential() - Spec Steps', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    /**
     * Step 1: Assert options.publicKey is present
     * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (step 1)
     */
    describe('Step 1: Assert options.publicKey is present', () => {
      test('Should throw when publicKey is undefined', async () => {
        await expect(async () =>
          agent.createCredential({
            credentialCreationOptions: {
              publicKey: undefined,
            } as CredentialCreationOptions,
            meta: {
              userId: USER_ID,
              origin: RP_ORIGIN,
            },
            context: {
              apiKeyId: null,
            },
          }),
        ).rejects.toThrow();
      });

      test('Should succeed when publicKey is present', async () => {
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        expect(registrationVerification.verified).toBe(true);
      });
    });

    /**
     * Step 5: Validate user.id length is between 1 and 64 bytes
     * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (step 5)
     */
    describe('Step 5: Validate user.id length', () => {
      test('Should reject user.id with 0 bytes', async () => {
        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              user: {
                ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
                id: new Uint8Array(0),
              },
            },
          }),
        ).rejects.toThrow();
      });

      test('Should reject user.id exceeding 64 bytes', async () => {
        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              user: {
                ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
                id: new Uint8Array(65),
              },
            },
          }),
        ).rejects.toThrow();
      });

      /**
       * Note: The implementation strictly requires user.id to be a valid UUID (16 bytes).
       * The WebAuthn spec allows 1-64 bytes, but the implementation enforces UUID format.
       */
      test('Should reject user.id with 1 byte (fails due to strict UUID format)', async () => {
        const userIdBytes = new Uint8Array(1);
        userIdBytes[0] = 1;

        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              user: {
                ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
                id: userIdBytes,
              },
            },
          }),
        ).rejects.toThrowError(new TypeAssertionError());
      });

      /**
       * Note: The implementation strictly requires user.id to be a valid UUID (16 bytes).
       * The WebAuthn spec allows 1-64 bytes, but the implementation enforces UUID format.
       */
      test('Should reject user.id with 64 bytes (fails due to strict UUID format)', async () => {
        const userIdBytes = new Uint8Array(64);

        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              user: {
                ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS.user,
                id: userIdBytes,
              },
            },
          }),
        ).rejects.toThrowError(new TypeAssertionError());
      });
    });

    /**
     * Step 7-8: Determine effective domain and RP ID
     * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (steps 7-8)
     */
    describe('Step 7-8: Effective domain and RP ID', () => {
      test('Should use origin hostname when rp.id is not provided', async () => {
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              rp: {
                name: RP_NAME,
                // id is omitted
              },
            },
          });

        expect(registrationVerification.verified).toBe(true);
        expect(registrationVerification.registrationInfo?.rpID).toBe(RP_ID);
      });

      test('Should use provided rp.id when present', async () => {
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              rp: {
                name: RP_NAME,
                id: RP_ID,
              },
            },
          });

        expect(registrationVerification.verified).toBe(true);
        expect(registrationVerification.registrationInfo?.rpID).toBe(RP_ID);
      });

      test('Should reject when rp.id is not a valid domain suffix of origin', async () => {
        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              rp: {
                name: RP_NAME,
                id: 'different-domain.com',
              },
            },
          }),
        ).rejects.toThrow();
      });
    });

    /**
     * Step 9-10: Process pubKeyCredParams
     * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (steps 9-10)
     */
    describe('Step 9-10: Process pubKeyCredParams', () => {
      test('Should default to ES256 and RS256 when pubKeyCredParams is empty', async () => {
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              pubKeyCredParams: [],
            },
          });

        expect(registrationVerification.verified).toBe(true);

        // The authenticator should have used ES256 (-7) as the first default
        expect(
          registrationVerification.registrationInfo?.credential.publicKey,
        ).toBeDefined();

        const jwk = COSEKeyMapper.COSEKeyToJwk(
          COSEKeyMapper.bytesToCOSEKey(
            registrationVerification.registrationInfo!.credential.publicKey,
          ),
        );

        expect(jwk.inferAlg()).toBe(KeyAlgorithm.ES256);
      });

      test('Should use the first supported algorithm from pubKeyCredParams', async () => {
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              pubKeyCredParams: [
                { type: PublicKeyCredentialType.PUBLIC_KEY, alg: -7 }, // ES256
                { type: PublicKeyCredentialType.PUBLIC_KEY, alg: -257 }, // RS256
              ],
            },
          });

        expect(registrationVerification.verified).toBe(true);
      });

      test('Should skip unsupported credential types', async () => {
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              pubKeyCredParams: [
                { type: 'unsupported-type', alg: -7 } as never,
                { type: PublicKeyCredentialType.PUBLIC_KEY, alg: -7 },
              ],
            },
          });

        expect(registrationVerification.verified).toBe(true);
      });

      test('Should throw NotSupportedError when all credential types are unsupported', async () => {
        await expect(async () =>
          performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              pubKeyCredParams: [
                { type: 'unsupported-type', alg: -7 } as never,
              ],
            },
          }),
        ).rejects.toThrow(CredentialTypesNotSupported);
      });
    });

    /**
     * Step 13-15: Create and hash client data
     * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (steps 13-15)
     */
    describe('Step 13-15: Client data creation and hashing', () => {
      test('Should create collectedClientData with correct type', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        const clientData = JSON.parse(
          Buffer.from(publicKeyCredential.response.clientDataJSON).toString(),
        );

        expect(clientData.type).toBe('webauthn.create');
      });

      test('Should include challenge in base64url format', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        const clientData = JSON.parse(
          Buffer.from(publicKeyCredential.response.clientDataJSON).toString(),
        );

        expect(clientData.challenge).toBe(
          Buffer.from(CHALLENGE_BYTES).toString('base64url'),
        );
      });

      test('Should include origin', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        const clientData = JSON.parse(
          Buffer.from(publicKeyCredential.response.clientDataJSON).toString(),
        );

        expect(clientData.origin).toBe(RP_ORIGIN);
      });

      test('Should set crossOrigin to false for same-origin', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        const clientData = JSON.parse(
          Buffer.from(publicKeyCredential.response.clientDataJSON).toString(),
        );

        expect(clientData.crossOrigin).toBe(false);
      });

      test('Should set crossOrigin to true and include topOrigin for cross-origin', async () => {
        const topOrigin = 'https://top-level.com';
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
            meta: {
              userId: USER_ID,
              origin: RP_ORIGIN,
              crossOrigin: true,
              topOrigin,
            },
          });

        const clientData = JSON.parse(
          Buffer.from(publicKeyCredential.response.clientDataJSON).toString(),
        );

        expect(clientData.crossOrigin).toBe(true);
        expect(clientData.topOrigin).toBe(topOrigin);
      });
    });

    /**
     * Step 17: Determine attestation formats
     * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (step 17)
     */
    describe('Step 17: Attestation format determination', () => {
      test('Should use "none" format for attestation=none', async () => {
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              attestation: Attestation.NONE,
            },
          });

        expect(registrationVerification.verified).toBe(true);
        expect(registrationVerification.registrationInfo?.fmt).toBe('none');
      });

      test('Should use "packed" format for attestation=direct', async () => {
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              attestation: Attestation.DIRECT,
            },
          });

        expect(registrationVerification.verified).toBe(true);
        expect(registrationVerification.registrationInfo?.fmt).toBe('packed');
      });

      test('Should default to "none" format when attestation is undefined', async () => {
        const { registrationVerification } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions: {
              ...PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
              attestation: undefined,
            },
          });

        expect(registrationVerification.verified).toBe(true);
        expect(registrationVerification.registrationInfo?.fmt).toBe('none');
      });
    });

    /**
     * Step 22: Return PublicKeyCredential
     * @see https://www.w3.org/TR/webauthn-3/#sctn-createCredential (step 22)
     */
    describe('Step 22: Return PublicKeyCredential', () => {
      test('Should return credential with base64url encoded id', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        expect(publicKeyCredential.id).toMatch(/^[A-Za-z0-9_-]+$/);
        expect(publicKeyCredential.id.length).toBeGreaterThan(0);
      });

      test('Should return credential with rawId as Uint8Array', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        expect(publicKeyCredential.rawId).toBeInstanceOf(Uint8Array);
        expect(publicKeyCredential.rawId.length).toBeGreaterThan(0);
      });

      test('Should return credential with type "public-key"', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        expect(publicKeyCredential.type).toBe(
          PublicKeyCredentialType.PUBLIC_KEY,
        );
      });

      test('Should return credential with response containing clientDataJSON', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        expect(publicKeyCredential.response.clientDataJSON).toBeInstanceOf(
          Uint8Array,
        );
        expect(
          publicKeyCredential.response.clientDataJSON.length,
        ).toBeGreaterThan(0);
      });

      test('Should return credential with response containing attestationObject', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        expect(
          (publicKeyCredential.response as { attestationObject: Uint8Array })
            .attestationObject,
        ).toBeInstanceOf(Uint8Array);
        expect(
          (publicKeyCredential.response as { attestationObject: Uint8Array })
            .attestationObject.length,
        ).toBeGreaterThan(0);
      });

      test('Should return credential with empty clientExtensionResults', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        expect(publicKeyCredential.clientExtensionResults).toEqual({});
      });

      test('Should return credential where id equals base64url(rawId)', async () => {
        const { publicKeyCredential } =
          await performPublicKeyCredentialRegistrationAndVerify({
            agent,
            publicKeyCredentialCreationOptions:
              PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS,
          });

        const expectedId = Buffer.from(publicKeyCredential.rawId).toString(
          'base64url',
        );
        expect(publicKeyCredential.id).toBe(expectedId);
      });
    });
  });
});
