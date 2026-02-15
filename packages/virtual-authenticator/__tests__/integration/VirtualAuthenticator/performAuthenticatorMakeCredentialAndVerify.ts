import { USER_ID, USER_NAME } from '../../../../auth/__tests__/helpers/consts';

import { UUIDMapper } from '@repo/core/mappers';
import { Hash } from '@repo/crypto';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import type { PrismaClient } from '@repo/prisma';
import { expect } from 'vitest';

import type { IAuthenticator } from '../../../src/authenticator/IAuthenticator';
import { VirtualAuthenticator } from '../../../src/authenticator/VirtualAuthenticator';
import { UserPresenceRequired } from '../../../src/authenticator/exceptions/UserPresenceRequired';
import { UserVerificationRequired } from '../../../src/authenticator/exceptions/UserVerificationRequired';
import { decodeAttestationObject } from '../../../src/cbor/decodeAttestationObject';
import { parseAuthenticatorData } from '../../../src/cbor/parseAuthenticatorData';
import { CollectedClientDataType } from '../../../src/enums/CollectedClientDataType';
import { PublicKeyCredentialType } from '../../../src/enums/PublicKeyCredentialType';
import type { RegistrationState } from '../../../src/state/RegistrationStateSchema';
import type { AuthenticatorMakeCredentialArgs } from '../../../src/validation/authenticator/AuthenticatorMakeCredentialArgsSchema';
import type { AuthenticatorMakeCredentialResponse } from '../../../src/validation/authenticator/AuthenticatorMakeCredentialResponseSchema';
import type { AuthenticatorMetaArgs } from '../../../src/validation/authenticator/AuthenticatorMetaArgsSchema';
import type { CollectedClientData } from '../../../src/validation/spec/CollectedClientDataSchema';
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

export const CLIENT_DATA_JSON = new Uint8Array(
  Buffer.from(JSON.stringify(COLLECTED_CLIENT_DATA)),
);

export const CLIENT_DATA_HASH = Hash.sha256(CLIENT_DATA_JSON);

export const AUTHENTICATOR_MAKE_CREDENTIAL_ARGS: AuthenticatorMakeCredentialArgs =
  {
    attestationFormats: [],
    credTypesAndPubKeyAlgs: [
      { type: PublicKeyCredentialType.PUBLIC_KEY, alg: COSEKeyAlgorithm.ES256 },
    ],
    enterpriseAttestationPossible: false,
    excludeCredentialDescriptorList: undefined,
    authenticatorExtensions: {},
    hash: CLIENT_DATA_HASH,
    requireResidentKey: false,
    requireUserPresence: true,
    requireUserVerification: false,
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

export type PerformAuthenticatorMakeCredentialAndVerifyArgs = {
  authenticator: IAuthenticator;
  authenticatorMakeCredentialArgs: AuthenticatorMakeCredentialArgs;
  prisma: PrismaClient;
  meta?: Partial<AuthenticatorMetaArgs>;
  state?: RegistrationState;
};

export const performAuthenticatorMakeCredentialAndVerify = async (
  opts: PerformAuthenticatorMakeCredentialAndVerifyArgs,
) => {
  const {
    authenticator,
    authenticatorMakeCredentialArgs,
    prisma,
    meta,
    state,
  } = opts;

  let retries = -1;
  let currentState: RegistrationState | undefined = state;
  let authenticatorMakeCredentialResponse:
    | AuthenticatorMakeCredentialResponse
    | undefined;

  // Simple loop to retry if user presence or verification is required
  // The VirtualAuthenticator is stateless but expects state arguments to be passed for multi-step operations
  while (!authenticatorMakeCredentialResponse) {
    retries++;

    try {
      authenticatorMakeCredentialResponse =
        await authenticator.authenticatorMakeCredential({
          authenticatorMakeCredentialArgs,
          meta: {
            userId: USER_ID,
            userPresenceEnabled: true,
            userVerificationEnabled: true,
            apiKeyId: null,
            ...meta,
          },
          state: currentState,
        });
    } catch (error) {
      if (error instanceof UserPresenceRequired) {
        currentState = {
          ...currentState,
          up: true,
        };
      } else if (error instanceof UserVerificationRequired) {
        currentState = {
          ...currentState,
          uv: true,
        };
      } else {
        throw error;
      }
    }
  }

  const attestationObjectMap = decodeAttestationObject(
    authenticatorMakeCredentialResponse.attestationObject,
  );

  const authData = attestationObjectMap.get('authData');

  const parsedAuthenticatorData = parseAuthenticatorData(authData);

  expect(parsedAuthenticatorData.aaguid).toStrictEqual(
    VirtualAuthenticator.AAGUID,
  );
  expect(parsedAuthenticatorData.extensionsData).toBe(undefined);

  // New credential counter should be always 0
  expect(parsedAuthenticatorData.counter).toBe(0);

  expect(parsedAuthenticatorData.flags.up).toBe(true);
  expect(parsedAuthenticatorData.flags.be).toBe(true);
  expect(parsedAuthenticatorData.flags.bs).toBe(true);

  if (authenticatorMakeCredentialArgs.requireUserVerification) {
    expect(parsedAuthenticatorData.flags.uv).toBe(true);
  }

  expect(parsedAuthenticatorData.rpIdHash).toStrictEqual(
    Hash.sha256(authenticatorMakeCredentialArgs.rpEntity.id),
  );

  const webAuthnPublicKeyCredentialCount =
    await prisma.webAuthnPublicKeyCredential.count({
      where: {
        id: UUIDMapper.bytesToUUID(parsedAuthenticatorData.credentialID!),
      },
    });

  expect(webAuthnPublicKeyCredentialCount).toBe(1);

  return {
    response: authenticatorMakeCredentialResponse,
    attestationObjectMap,
    parsedAuthenticatorData,
    retries,
  };
};
