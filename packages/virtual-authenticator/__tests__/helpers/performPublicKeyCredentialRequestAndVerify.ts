import { USER_ID } from '../../../auth/__tests__/helpers';

import {
  AuthenticationResponseJSON,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { expect } from 'vitest';

import { PublicKeyCredentialDtoSchema } from '../../../contract/src/dto/credentials/components/PublicKeyCredentialDtoSchema';
import { VirtualAuthenticator } from '../../src/VirtualAuthenticator';
import { PublicKeyCredentialRequestOptions } from '../../src/zod-validation';
import { CHALLENGE_BASE64URL, RP_ID, RP_ORIGIN } from './consts';

export type PerformPublicKeyCredentialRequestAndVerifyArgs = {
  authenticator: VirtualAuthenticator;
  requestOptions: PublicKeyCredentialRequestOptions;
  id: string;
  publicKey: Uint8Array<ArrayBuffer>;
  counter: number;
  expectedNewCounter: number;
  requireUserVerification?: boolean;
};

export type PerformPublicKeyCredentialRequestAndVerifyResult = {};

export const performPublicKeyCredentialRequestAndVerify = async (
  opts: PerformPublicKeyCredentialRequestAndVerifyArgs,
): Promise<PerformPublicKeyCredentialRequestAndVerifyResult> => {
  const {
    authenticator,
    requestOptions,
    id,
    publicKey,
    counter,
    expectedNewCounter,
    requireUserVerification,
  } = opts;

  const publicKeyCredential = await authenticator.getCredential({
    publicKeyCredentialRequestOptions: requestOptions,
    meta: {
      userId: USER_ID,
      origin: RP_ORIGIN,
    },
    context: {
      apiKeyId: null,
    },
  });

  const authenticationVerification = await verifyAuthenticationResponse({
    response: PublicKeyCredentialDtoSchema.encode(
      publicKeyCredential,
    ) as AuthenticationResponseJSON,
    expectedChallenge: CHALLENGE_BASE64URL,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id,
      publicKey,
      counter,
    },
    requireUserVerification,
  });

  // The most important check: confirm that the authentication was successful.
  expect(authenticationVerification.verified).toBe(true);

  // A critical security check: ensure the signature counter has incremented.
  expect(authenticationVerification.authenticationInfo.newCounter).toBe(
    expectedNewCounter,
  );

  return {};
};
