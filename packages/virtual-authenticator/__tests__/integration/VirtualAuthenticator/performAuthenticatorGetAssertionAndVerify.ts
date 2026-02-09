import { USER_ID } from '../../../../auth/__tests__/helpers/consts';

import { UUIDMapper } from '@repo/core/mappers';
import { Hash } from '@repo/crypto';
import { encodeCOSEPublicKey } from '@repo/keys/cbor';
import type { PrismaClient } from '@repo/prisma';
import { verifySignature } from '@simplewebauthn/server/helpers';
import { expect } from 'vitest';

import { type IAuthenticator } from '../../../src';
import { decodeAttestationObject } from '../../../src/cbor';
import { parseAuthenticatorData } from '../../../src/cbor/parseAuthenticatorData';
import { CollectedClientDataType } from '../../../src/enums';
import type { AuthenticatorContextArgs } from '../../../src/validation/authenticator/AuthenticatorContextArgsSchema';
import type { AuthenticatorGetAssertionArgs } from '../../../src/validation/authenticator/AuthenticatorGetAssertionArgsSchema';
import type { AuthenticatorMakeCredentialResponse } from '../../../src/validation/authenticator/AuthenticatorMakeCredentialResponseSchema';
import type { AuthenticatorMetaArgs } from '../../../src/validation/authenticator/AuthenticatorMetaArgsSchema';
import type { CollectedClientData } from '../../../src/validation/spec/CollectedClientDataSchema';
import { CHALLENGE_BYTES, RP_ORIGIN, RP_ID } from '../../helpers';

export const COLLECTED_CLIENT_DATA: CollectedClientData = {
  type: CollectedClientDataType.WEBAUTHN_GET,
  challenge: Buffer.from(CHALLENGE_BYTES).toString('base64url'),
  origin: RP_ORIGIN,
  crossOrigin: false,
  topOrigin: undefined,
};

export const CLIENT_DATA_JSON = new Uint8Array(
  Buffer.from(JSON.stringify(COLLECTED_CLIENT_DATA)),
);

export const CLIENT_DATA_HASH = Hash.sha256(CLIENT_DATA_JSON);

export const AUTHENTICATOR_GET_ASSERTION_ARGS: AuthenticatorGetAssertionArgs = {
  requireUserPresence: true,
  requireUserVerification: false,
  rpId: RP_ID,
  allowCredentialDescriptorList: undefined,
  authenticatorExtensions: {},
  hash: CLIENT_DATA_HASH,
};

export type PerformAuthenticatorGetAssertionAndVerifyArgs = {
  authenticator: IAuthenticator;
  authenticatorGetAssertionArgs: AuthenticatorGetAssertionArgs;
  authenticatorMakeCredentialResponse: AuthenticatorMakeCredentialResponse;
  prisma: PrismaClient;
  meta?: Partial<AuthenticatorMetaArgs>;
  context?: AuthenticatorContextArgs;

  expectedCounter?: number;
};

export const performAuthenticatorGetAssertionAndVerify = async (
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
        apiKeyId: null,
        ...meta,
      },
      context: {
        up: true,
        uv: authenticatorGetAssertionArgs.requireUserVerification,
        ...context,
      },
    });

  const parsedGetAssertionAuthenticatorData = parseAuthenticatorData(
    authenticatorGetAssertionResponse.authenticatorData,
  );

  const makeCredentialAttestationObjectMap = decodeAttestationObject(
    authenticatorMakeCredentialResponse.attestationObject,
  );
  const parsedMakeCredentialAuthenticatorData = parseAuthenticatorData(
    makeCredentialAttestationObjectMap.get('authData'),
  );

  expect(parsedGetAssertionAuthenticatorData.aaguid).toBe(undefined);
  expect(parsedGetAssertionAuthenticatorData.credentialID).toBe(undefined);
  expect(parsedGetAssertionAuthenticatorData.credentialPublicKey).toBe(
    undefined,
  );
  expect(parsedGetAssertionAuthenticatorData.extensionsData).toBe(undefined);

  expect(parsedGetAssertionAuthenticatorData.flags.up).toBe(true);
  expect(parsedGetAssertionAuthenticatorData.flags.be).toBe(true);
  expect(parsedGetAssertionAuthenticatorData.flags.bs).toBe(true);

  if (authenticatorGetAssertionArgs.requireUserVerification) {
    expect(parsedGetAssertionAuthenticatorData.flags.uv).toBe(true);
  }

  expect(parsedGetAssertionAuthenticatorData.rpIdHash).toStrictEqual(
    Hash.sha256(authenticatorGetAssertionArgs.rpId),
  );

  if (expectedCounter !== undefined) {
    expect(parsedGetAssertionAuthenticatorData.counter).toBe(expectedCounter);

    const webAuthnPublicKeyCredential =
      await prisma.webAuthnPublicKeyCredential.findUnique({
        where: {
          id: UUIDMapper.bytesToUUID(
            parsedGetAssertionAuthenticatorData.credentialID!,
          ),
        },
      });

    expect(webAuthnPublicKeyCredential?.counter).toBe(expectedCounter);
  }

  const authenticatorData = authenticatorGetAssertionResponse.authenticatorData;

  const signatureData = Buffer.concat([
    authenticatorData,
    authenticatorGetAssertionArgs.hash,
  ]);

  const isVerified = await verifySignature({
    signature: authenticatorGetAssertionResponse.signature,
    credentialPublicKey: encodeCOSEPublicKey(
      parsedMakeCredentialAuthenticatorData.credentialPublicKey!,
    ),
    data: signatureData,
  });

  expect(isVerified).toBe(true);

  return {
    response: authenticatorGetAssertionResponse,
    parsedGetAssertionAuthenticatorData,
    parsedMakeCredentialAuthenticatorData,
  };
};
