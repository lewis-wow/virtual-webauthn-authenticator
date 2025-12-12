import {
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { CreateCredentialBodySchema } from '@repo/contract/dto';
import { UUIDMapper } from '@repo/core/mappers';
import { PublicKeyCredentialType } from '@repo/virtual-authenticator/enums';
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
  requireUserVerification?: boolean;
  requireUserPresence?: boolean;
};

export type PerformPublicKeyCredentialRegistrationAndVerifyResult = {
  response: Response;
  verification?: VerifiedRegistrationResponse;
  webAuthnCredentialId?: string;
};

export const performPublicKeyCredentialRegistrationAndVerify = async (
  opts: PerformPublicKeyCredentialRegistrationAndVerifyArgs,
): Promise<PerformPublicKeyCredentialRegistrationAndVerifyResult> => {
  const {
    app,
    token,
    payload,
    requireUserVerification,
    requireUserPresence,
    expectStatus,
  } = opts;

  const requestInit = request(app).post('/api/credentials/create');
  if (token !== undefined) {
    requestInit.set('Authorization', `Bearer ${token}`);
  }

  const response = await requestInit
    .send(payload)
    .expect('Content-Type', /json/)
    .expect(expectStatus ?? 200);

  if (expectStatus !== 200) {
    return { response };
  }

  const verification = await verifyRegistrationResponse({
    response: response.body as RegistrationResponseJSON,
    expectedChallenge: payload.publicKeyCredentialCreationOptions.challenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification,
    requireUserPresence,
  });

  expect(verification.verified).toBe(true);
  expect(verification.registrationInfo?.credential.counter).toBe(0);

  expect(response.body).toStrictEqual({
    clientExtensionResults: {},
    id: expect.any(String),
    rawId: expect.any(String),
    response: {
      attestationObject: expect.any(String),
      clientDataJSON:
        'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWU4wZ3RDc3VoTDhIZWR3TEhCRXFtUSIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9',
    },
    type: PublicKeyCredentialType.PUBLIC_KEY,
  });

  const webAuthnCredentialId = UUIDMapper.bytesToUUID(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Buffer.from(response.body.id, 'base64url'),
  );

  return {
    response,
    verification,
    webAuthnCredentialId,
  };
};
