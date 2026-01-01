import {
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { CreateCredentialBodySchema } from '@repo/contract/dto';
import { UUIDMapper } from '@repo/core/mappers';
import {
  PublicKeyCredentialType,
  UserVerificationRequirement,
} from '@repo/virtual-authenticator/enums';
import {
  type RegistrationResponseJSON,
  VerifiedRegistrationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import request, { type Response } from 'supertest';
import { App } from 'supertest/types';
import { expect } from 'vitest';
import z from 'zod';

export type PerformPublicKeyCredentialRegistrationAndVerifyArgs = {
  app: App;
  token: string | undefined;
  payload: z.input<typeof CreateCredentialBodySchema>;
  expectStatus: number;
};

export type PerformPublicKeyCredentialRegistrationAndVerifyResult = {
  response: Response;
  verification?: VerifiedRegistrationResponse;
  webAuthnPublicKeyCredentialId?: string;
};

export const performPublicKeyCredentialRegistrationAndVerify = async (
  opts: PerformPublicKeyCredentialRegistrationAndVerifyArgs,
): Promise<PerformPublicKeyCredentialRegistrationAndVerifyResult> => {
  const { app, token, payload, expectStatus } = opts;

  const requestInit = request(app).post('/api/credentials/create');
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

  const verification = await verifyRegistrationResponse({
    response: response.body as RegistrationResponseJSON,
    expectedChallenge: payload.publicKeyCredentialCreationOptions.challenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification:
      payload.publicKeyCredentialCreationOptions.authenticatorSelection
        ?.userVerification === UserVerificationRequirement.REQUIRED,
    requireUserPresence: true,
  });

  expect(verification.verified).toBe(true);
  expect(verification.registrationInfo?.credential.counter).toBe(0);

  expect(response.body).toStrictEqual({
    clientExtensionResults: {},
    id: expect.any(String),
    rawId: expect.any(String),
    response: {
      attestationObject: expect.any(String),
      clientDataJSON: expect.any(String),
    },
    type: PublicKeyCredentialType.PUBLIC_KEY,
  });

  const webAuthnPublicKeyCredentialId = UUIDMapper.bytesToUUID(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Buffer.from(response.body.id, 'base64url'),
  );

  return {
    response,
    verification,
    webAuthnPublicKeyCredentialId,
  };
};
