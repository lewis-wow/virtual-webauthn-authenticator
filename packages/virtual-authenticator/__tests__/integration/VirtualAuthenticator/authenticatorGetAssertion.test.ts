import {
  API_KEY_ID,
  upsertTestingUser,
  USER_ID,
} from '../../../../auth/__tests__/helpers';

import { TypeAssertionError } from '@repo/assert';
import { Hash } from '@repo/crypto';
import { PrismaClient } from '@repo/prisma';
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
import { AuthenticatorGetAssertionArgsDtoSchema } from '../../../src/dto/authenticator/AuthenticatorGetAssertionArgsDtoSchema';
import { PublicKeyCredentialType } from '../../../src/enums';
import { UserPresenceNotAvailable } from '../../../src/exceptions/UserPresenceNotAvailable';
import { UserVerificationNotAvailable } from '../../../src/exceptions/UserVerificationNotAvailable';
import { VirtualAuthenticatorCredentialSelectInterruption } from '../../../src/interruption';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import type {
  AuthenticatorGetAssertionArgs,
  AuthenticatorMakeCredentialResponse,
  AuthenticatorMetaArgs,
} from '../../../src/validation';
import { RP_ID } from '../../helpers';
import { KeyVaultKeyIdGenerator } from '../../helpers/KeyVaultKeyIdGenerator';
import { MockKeyProvider } from '../../helpers/MockKeyProvider';
import {
  AUTHENTICATOR_GET_ASSERTION_ARGS,
  performAuthenticatorGetAssertionAndVerify,
} from './performAuthenticatorGetAssertionAndVerify';
import {
  AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
  performAuthenticatorMakeCredentialAndVerify,
} from './performAuthenticatorMakeCredentialAndVerify';

/**
 * Tests for VirtualAuthenticator.authenticatorGetAssertion() method
 * @see https://www.w3.org/TR/webauthn-3/#sctn-op-get-assertion
 * @see https://www.w3.org/TR/webauthn-3/#authenticatorGetAssertion
 */
describe('VirtualAuthenticator.authenticatorGetAssertion()', () => {
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

  let authenticatorMakeCredentialResponse: AuthenticatorMakeCredentialResponse;

  beforeAll(async () => {
    await upsertTestingUser({ prisma });
  });

  beforeEach(async () => {
    const { response } = await performAuthenticatorMakeCredentialAndVerify({
      authenticator,
      authenticatorMakeCredentialArgs: AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
      prisma,
    });

    authenticatorMakeCredentialResponse = response;
  });

  afterEach(async () => {
    await cleanupWebAuthnPublicKeyCredentials();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  describe('AuthenticatorMakeCredentialArgs.requireUserPresence', () => {
    test('args.requireUserPresence: true, meta.userPresenceEnabled: true', async () => {
      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        requireUserPresence: true,
      } as AuthenticatorGetAssertionArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userPresenceEnabled: true,
      };

      await performAuthenticatorGetAssertionAndVerify({
        authenticator,
        prisma,
        authenticatorGetAssertionArgs,
        meta,
        authenticatorMakeCredentialResponse,
      });
    });

    test('args.requireUserPresence: true, meta.userPresenceEnabled: false', async () => {
      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        requireUserPresence: true,
      } as AuthenticatorGetAssertionArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userPresenceEnabled: false,
      };

      await expect(() =>
        performAuthenticatorGetAssertionAndVerify({
          authenticator,
          prisma,
          authenticatorGetAssertionArgs,
          meta,
          authenticatorMakeCredentialResponse,
        }),
      ).rejects.toThrowError(new UserPresenceNotAvailable());
    });

    test('args.requireUserPresence: false, meta.userPresenceEnabled: true', async () => {
      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        requireUserPresence: false,
      } as AuthenticatorGetAssertionArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userPresenceEnabled: true,
      };

      await performAuthenticatorGetAssertionAndVerify({
        authenticator,
        prisma,
        authenticatorGetAssertionArgs,
        meta,
        authenticatorMakeCredentialResponse,
      });
    });

    test('args.requireUserPresence: false, meta.userPresenceEnabled: false', async () => {
      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        requireUserPresence: false,
      } as AuthenticatorGetAssertionArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userPresenceEnabled: false,
      };

      await performAuthenticatorGetAssertionAndVerify({
        authenticator,
        prisma,
        authenticatorGetAssertionArgs,
        meta,
        authenticatorMakeCredentialResponse,
      });
    });
  });

  describe('AuthenticatorMakeCredentialArgs.requireUserVerification', () => {
    test('args.requireUserVerification: true, meta.userVerificationEnabled: true', async () => {
      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        requireUserVerification: true,
      } as AuthenticatorGetAssertionArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userVerificationEnabled: true,
      };

      await performAuthenticatorGetAssertionAndVerify({
        authenticator,
        prisma,
        authenticatorGetAssertionArgs,
        meta,
        authenticatorMakeCredentialResponse,
      });
    });

    test('args.requireUserVerification: true, meta.userVerificationEnabled: false', async () => {
      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        requireUserVerification: true,
      } as AuthenticatorGetAssertionArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userVerificationEnabled: false,
      };

      await expect(() =>
        performAuthenticatorGetAssertionAndVerify({
          authenticator,
          prisma,
          authenticatorGetAssertionArgs,
          meta,
          authenticatorMakeCredentialResponse,
        }),
      ).rejects.toThrowError(new UserVerificationNotAvailable());
    });

    test('args.requireUserVerification: false, meta.userVerificationEnabled: true', async () => {
      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        requireUserVerification: false,
      } as AuthenticatorGetAssertionArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userVerificationEnabled: true,
      };

      await performAuthenticatorGetAssertionAndVerify({
        authenticator,
        prisma,
        authenticatorGetAssertionArgs,
        meta,
        authenticatorMakeCredentialResponse,
      });
    });

    test('args.requireUserVerification: false, meta.userVerificationEnabled: false', async () => {
      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        requireUserVerification: false,
      } as AuthenticatorGetAssertionArgs;

      const meta: Partial<AuthenticatorMetaArgs> = {
        userVerificationEnabled: false,
      };

      await performAuthenticatorGetAssertionAndVerify({
        authenticator,
        prisma,
        authenticatorGetAssertionArgs,
        meta,
        authenticatorMakeCredentialResponse,
      });
    });
  });

  describe('AuthenticatorMakeCredentialArgs.allowCredentialDescriptorList', () => {
    test('Client-side discovery for single credential', async () => {
      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        allowCredentialDescriptorList: undefined,
      } as AuthenticatorGetAssertionArgs;

      await performAuthenticatorGetAssertionAndVerify({
        authenticator,
        prisma,
        authenticatorGetAssertionArgs,
        authenticatorMakeCredentialResponse,
      });
    });

    test('Client-side discovery for multiple credential', async () => {
      await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        authenticatorMakeCredentialArgs: AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        prisma,
      });

      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        allowCredentialDescriptorList: undefined,
      } as AuthenticatorGetAssertionArgs;

      const meta: AuthenticatorMetaArgs = {
        userId: USER_ID,
        apiKeyId: null,
        userPresenceEnabled: true,
        userVerificationEnabled: true,
      };

      const expectedCredentialOptions =
        await webAuthnPublicKeyCredentialRepository.findAllApplicableCredentialsByRpIdAndUserWithAllowCredentialDescriptorList(
          {
            rpId: RP_ID,
            userId: USER_ID,
            apiKeyId: null,
            allowCredentialDescriptorList: undefined,
          },
        );

      const expectedHash = Hash.sha256JSON({
        authenticatorGetAssertionArgs:
          AuthenticatorGetAssertionArgsDtoSchema.encode(
            authenticatorGetAssertionArgs,
          ),
        meta,
      });

      await expect(() =>
        performAuthenticatorGetAssertionAndVerify({
          authenticator,
          meta,
          prisma,
          authenticatorGetAssertionArgs,
          authenticatorMakeCredentialResponse,
        }),
      ).rejects.toThrowError(
        new VirtualAuthenticatorCredentialSelectInterruption({
          credentialOptions: expectedCredentialOptions,
          hash: expectedHash,
        }),
      );

      await performAuthenticatorGetAssertionAndVerify({
        authenticator,
        meta,
        prisma,
        authenticatorGetAssertionArgs,
        authenticatorMakeCredentialResponse,
        context: {
          hash: expectedHash,
          selectedCredentailOptionId: expectedCredentialOptions[0]!.id,
        },
      });
    });

    test('Client-side discovery for multiple credential with invalid hash - different meta', async () => {
      await performAuthenticatorMakeCredentialAndVerify({
        authenticator,
        authenticatorMakeCredentialArgs: AUTHENTICATOR_MAKE_CREDENTIAL_ARGS,
        prisma,
      });

      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        allowCredentialDescriptorList: undefined,
      } as AuthenticatorGetAssertionArgs;

      const meta: AuthenticatorMetaArgs = {
        userId: USER_ID,
        apiKeyId: null,
        userPresenceEnabled: true,
        userVerificationEnabled: true,
      };

      const expectedCredentialOptions =
        await webAuthnPublicKeyCredentialRepository.findAllApplicableCredentialsByRpIdAndUserWithAllowCredentialDescriptorList(
          {
            rpId: RP_ID,
            userId: USER_ID,
            apiKeyId: null,
            allowCredentialDescriptorList: undefined,
          },
        );

      const expectedHash = Hash.sha256JSON({
        authenticatorGetAssertionArgs:
          AuthenticatorGetAssertionArgsDtoSchema.encode(
            authenticatorGetAssertionArgs,
          ),
        meta,
      });

      await expect(() =>
        performAuthenticatorGetAssertionAndVerify({
          authenticator,
          meta,
          prisma,
          authenticatorGetAssertionArgs,
          authenticatorMakeCredentialResponse,
        }),
      ).rejects.toThrowError(
        new VirtualAuthenticatorCredentialSelectInterruption({
          credentialOptions: expectedCredentialOptions,
          hash: expectedHash,
        }),
      );

      await expect(() =>
        performAuthenticatorGetAssertionAndVerify({
          authenticator,
          meta: {
            ...meta,
            apiKeyId: API_KEY_ID, // This was changed.
          },
          prisma,
          authenticatorGetAssertionArgs,
          authenticatorMakeCredentialResponse,
          context: {
            hash: expectedHash,
            selectedCredentailOptionId: expectedCredentialOptions[0]!.id,
          },
        }),
      ).rejects.toThrowError(new TypeAssertionError());
    });

    test('Authentication with existing public key credential', async () => {
      const authenticatorGetAssertionArgs = {
        ...AUTHENTICATOR_GET_ASSERTION_ARGS,
        allowCredentialDescriptorList: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            id: authenticatorMakeCredentialResponse.credentialId,
          },
        ],
      } as AuthenticatorGetAssertionArgs;

      await performAuthenticatorGetAssertionAndVerify({
        authenticator,
        prisma,
        authenticatorGetAssertionArgs,
        authenticatorMakeCredentialResponse,
      });
    });
  });
});
