import { USER_ID } from '@repo/auth/__tests__/helpers';
import {
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { GetCredentialBodySchema } from '@repo/contract/dto';
import { UUIDMapper } from '@repo/core/mappers';
import {
  PublicKeyCredentialType,
  UserVerificationRequirement,
} from '@repo/virtual-authenticator/enums';
import {
  AuthenticationResponseJSON,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import request, { type Response } from 'supertest';
import { App } from 'supertest/types';
import { expect } from 'vitest';
import z from 'zod';

export type PerformPublicKeyCredentialRequestAndVerifyArgs = {
  app: App;
  token: string | undefined;
  payload: z.input<typeof GetCredentialBodySchema>;
  registrationVerification: VerifiedRegistrationResponse;
  expectedNewCounter: number;
  expectStatus: number;
};

export type PerformPublicKeyCredentialRequestAndVerifyResult = {
  response: Response;
  verification?: VerifiedAuthenticationResponse;
  webAuthnCredentialId?: string;
};

export const performPublicKeyCredentialRequestAndVerify = async (
  opts: PerformPublicKeyCredentialRequestAndVerifyArgs,
): Promise<PerformPublicKeyCredentialRequestAndVerifyResult> => {
  const {
    app,
    payload,
    registrationVerification,
    token,
    expectedNewCounter,
    expectStatus,
  } = opts;

  const { id: webAuthnCredentialId, publicKey: credentialPublicKey } =
    registrationVerification.registrationInfo!.credential;

  const requestInit = request(app).post('/api/credentials/get');
  if (token !== undefined) {
    requestInit.set('Authorization', `Bearer ${token}`);
  }

  const response = await requestInit
    .send(payload)
    .expect('Content-Type', /json/)
    .expect(expectStatus);

  if (expectStatus !== 200) {
    return { response };
  }

  const verification = await verifyAuthenticationResponse({
    response: response.body as AuthenticationResponseJSON,
    expectedChallenge: payload.publicKeyCredentialRequestOptions.challenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,

    credential: {
      id: webAuthnCredentialId,
      publicKey: credentialPublicKey,
      // The counter is stateful from the previous test verification
      counter: expectedNewCounter - 1,
    },

    requireUserVerification:
      payload.publicKeyCredentialRequestOptions.userVerification ===
      UserVerificationRequirement.REQUIRED,
  });

  // The most important check: confirm that the authentication was successful.
  expect(verification.verified).toBe(true);

  // A critical security check: ensure the signature counter has incremented.
  expect(verification.authenticationInfo.newCounter).toBe(expectedNewCounter);

  expect(response.body).toStrictEqual({
    clientExtensionResults: {},
    id: expect.any(String),
    rawId: expect.any(String),
    response: {
      authenticatorData: expect.any(String),
      clientDataJSON: expect.any(String),
      signature: expect.any(String),
      userHandle: Buffer.from(UUIDMapper.UUIDtoBytes(USER_ID)).toString(
        'base64url',
      ),
    },
    type: PublicKeyCredentialType.PUBLIC_KEY,
  });

  return { response, verification, webAuthnCredentialId };
};
