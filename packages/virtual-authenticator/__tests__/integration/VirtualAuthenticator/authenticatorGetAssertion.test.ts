import {
  upsertTestingUser,
  USER_ID,
  USER_NAME,
} from '../../../../auth/__tests__/helpers';

import { TypeAssertionError } from '@repo/assert';
import { UUIDMapper } from '@repo/core/mappers';
import { Hash } from '@repo/crypto';
import { verifyEC, type COSEPublicKeyEC } from '@repo/keys';
import { COSEKeyAlgorithm, COSEKeyParam } from '@repo/keys/enums';
import { PrismaClient } from '@repo/prisma';
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

import type { IAuthenticator } from '../../../src';
import { VirtualAuthenticator } from '../../../src/VirtualAuthenticator';
import {
  decodeAttestationObject,
  parseAuthenticatorData,
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
  AuthenticatorGetAssertionArgs,
  AuthenticatorMakeCredentialArgs,
  AuthenticatorMakeCredentialResponse,
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

const AUTHENTICATOR_GET_ASSERTION_ARGS: AuthenticatorGetAssertionArgs = {
  requireUserPresence: true,
  requireUserVerification: false,
  rpId: RP_ID,
  allowCredentialDescriptorList: undefined,
  extensions: {},
  hash: CLIENT_DATA_HASH,
};

type PerformAuthenticatorGetAssertionAndVerifyArgs = {
  authenticator: IAuthenticator;
  authenticatorGetAssertionArgs: AuthenticatorGetAssertionArgs;
  authenticatorMakeCredentialResponse: AuthenticatorMakeCredentialResponse;
  prisma: PrismaClient;
  meta?: Partial<AuthenticatorMetaArgs>;
  context?: Partial<AuthenticatorContextArgs>;

  expectedCounter?: number;
};

const performAuthenticatorGetAssertionAndVerify = async (
  opts: PerformAuthenticatorGetAssertionAndVerifyArgs,
) => {
  const {
    authenticator,
    authenticatorGetAssertionArgs,
    authenticatorMakeCredentialResponse,
    prisma,
    meta,
    context,
    expectedCounter,
  } = opts;

  const authenticatorGetAssertionResponse =
    await authenticator.authenticatorGetAssertion({
      authenticatorGetAssertionArgs,
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

  const parsedAuthenticatorData = parseAuthenticatorData(
    authenticatorGetAssertionResponse.authenticatorData,
  );

  expect(parsedAuthenticatorData.aaguid).toStrictEqual(
    VirtualAuthenticator.AAGUID,
  );
  // New credential counter should be always 0
  expect(parsedAuthenticatorData.counter).toBe(0);

  expect(parsedAuthenticatorData.flags.up).toBe(true);
  expect(parsedAuthenticatorData.flags.be).toBe(true);
  expect(parsedAuthenticatorData.flags.bs).toBe(true);

  if (authenticatorGetAssertionArgs.requireUserVerification) {
    expect(parsedAuthenticatorData.flags.uv).toBe(true);
  }

  expect(parsedAuthenticatorData.extensionsData).toBe(undefined);
  expect(parsedAuthenticatorData.rpIdHash).toStrictEqual(
    Hash.sha256(authenticatorGetAssertionArgs.rpId),
  );

  if (expectedCounter !== undefined) {
    const webAuthnPublicKeyCredential =
      await prisma.webAuthnPublicKeyCredential.findUnique({
        where: {
          id: UUIDMapper.bytesToUUID(parsedAuthenticatorData.credentialID!),
        },
      });

    expect(webAuthnPublicKeyCredential?.counter).toBe(expectedCounter);
  }

  verifySignature({
    signature: authenticatorGetAssertionResponse.signature,
  });

  return {
    response: authenticatorMakeCredentialResponse,
    attestationObjectMap,
    parsedAuthenticatorData,
  };
};

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

  beforeAll(async () => {
    await upsertTestingUser({ prisma });
  });

  afterEach(async () => {
    await cleanupWebAuthnPublicKeyCredentials();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });
});
