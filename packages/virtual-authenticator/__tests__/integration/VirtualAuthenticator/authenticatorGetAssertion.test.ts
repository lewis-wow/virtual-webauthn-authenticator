import { upsertTestingUser } from '../../../../auth/__tests__/helpers';

import { PrismaClient } from '@repo/prisma';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  test,
} from 'vitest';

import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import { PrismaWebAuthnRepository } from '../../../src/repositories/PrismaWebAuthnRepository';
import type { AuthenticatorMakeCredentialResponse } from '../../../src/validation';
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

  describe('test', () => {
    test('test', async () => {
      const authenticatorGetAssertionArgs = AUTHENTICATOR_GET_ASSERTION_ARGS;

      await performAuthenticatorGetAssertionAndVerify({
        authenticator,
        authenticatorGetAssertionArgs,
        authenticatorMakeCredentialResponse,
        prisma,
      });
    });
  });
});
