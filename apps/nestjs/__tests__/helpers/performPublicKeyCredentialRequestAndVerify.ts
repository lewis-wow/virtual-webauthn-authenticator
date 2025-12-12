import { USER_ID } from '@repo/auth/__tests__/helpers';
import {
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { GetCredentialBodySchema } from '@repo/contract/dto';
import { UUIDMapper } from '@repo/core/mappers';
import { PublicKeyCredentialType } from '@repo/virtual-authenticator/enums';
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
  token: string;
  payload: z.input<typeof GetCredentialBodySchema>;
  registrationVerification: VerifiedRegistrationResponse;
  expectedNewCounter: number;
};

export type PerformPublicKeyCredentialRequestAndVerifyResult = {
  response: Response;
  verification: VerifiedAuthenticationResponse;
  webAuthnCredentialId: string;
};

export const performPublicKeyCredentialRequestAndVerify = async (
  opts: PerformPublicKeyCredentialRequestAndVerifyArgs,
): Promise<PerformPublicKeyCredentialRequestAndVerifyResult> => {
  const { app, payload, registrationVerification, token, expectedNewCounter } =
    opts;

  const { id: webAuthnCredentialId, publicKey: credentialPublicKey } =
    registrationVerification.registrationInfo!.credential;

  const response = await request(app)
    .post('/api/credentials/get')
    .set('Authorization', `Bearer ${token}`)
    .send(payload)
    .expect('Content-Type', /json/)
    .expect(200);

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
    requireUserVerification: true,
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
      clientDataJSON:
        'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiWU4wZ3RDc3VoTDhIZWR3TEhCRXFtUSIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9',
      signature: expect.any(String),
      userHandle: Buffer.from(UUIDMapper.UUIDtoBytes(USER_ID)).toString(
        'base64url',
      ),
    },
    type: PublicKeyCredentialType.PUBLIC_KEY,
  });

  return { response, verification, webAuthnCredentialId };
};
