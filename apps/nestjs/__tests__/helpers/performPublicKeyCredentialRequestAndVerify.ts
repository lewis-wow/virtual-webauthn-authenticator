import { USER_ID } from '@repo/auth/__tests__/helpers';
import {
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { GetCredentialBodySchema } from '@repo/contract/dto';
import { UUIDMapper } from '@repo/core/mappers';
import {
  PublicKeyCredentialType,
  UserVerification,
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
  expectStatus: number;

  expectedNewCounter?: number;
};

export type PerformPublicKeyCredentialRequestAndVerifyResult = {
  response: Response;
  verification?: VerifiedAuthenticationResponse;
  webAuthnPublicKeyCredentialId?: string;
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

  const {
    id: webAuthnPublicKeyCredentialId,
    publicKey: credentialPublicKey,
    counter,
  } = registrationVerification.registrationInfo!.credential;

  const requestInit = request(app).post('/api/credentials/get');
  if (token !== undefined) {
    requestInit.set('Authorization', `Bearer ${token}`);
  }

  const response = await requestInit
    .send(payload)
    .expect('Content-Type', /json/);

  expect(response.status).toBe(expectStatus);

  if (expectStatus !== 200) {
    return { response };
  }

  const verification = await verifyAuthenticationResponse({
    response: response.body as AuthenticationResponseJSON,
    expectedChallenge: payload.publicKeyCredentialRequestOptions.challenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: webAuthnPublicKeyCredentialId,
      publicKey: credentialPublicKey,
      counter,
    },
    requireUserVerification:
      payload.publicKeyCredentialRequestOptions.userVerification ===
      UserVerification.REQUIRED,
  });

  // The most important check: confirm that the authentication was successful.
  expect(verification.verified).toBe(true);

  // A critical security check: ensure the signature counter has incremented.
  if (expectedNewCounter !== undefined) {
    expect(verification.authenticationInfo.newCounter).toBe(expectedNewCounter);
  }

  expect(response.body).toStrictEqual({
    authenticatorAttachment: 'platform',
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

  return { response, verification, webAuthnPublicKeyCredentialId };
};
