import {
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { CreateCredentialBodySchema } from '@repo/contract/dto';
import { UUIDMapper } from '@repo/core/mappers';
import { isExceptionShape } from '@repo/exception';
import {
  UserPresenceRequiredAgentException,
  UserVerificationRequiredAgentException,
} from '@repo/virtual-authenticator/authenticatorAgent';
import {
  PublicKeyCredentialType,
  UserVerification,
} from '@repo/virtual-authenticator/enums';
import type { RegistrationState } from '@repo/virtual-authenticator/state';
import {
  type RegistrationResponseJSON,
  VerifiedRegistrationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import request, { type Response } from 'supertest';
import { App } from 'supertest/types';
import { match } from 'ts-pattern';
import { expect } from 'vitest';
import z from 'zod';

export type PerformPublicKeyCredentialRegistrationAndVerifyArgs = {
  app: App;
  token: string | undefined;
  payload: z.input<typeof CreateCredentialBodySchema>;
  expectStatus: number;
  /**
   * When true, skips the state token retry loop.
   * Useful for testing state-related error responses directly.
   * @default false
   */
  skipStateFlow?: boolean;
};

export type PerformPublicKeyCredentialRegistrationAndVerifyResult = {
  response: Response;
  verification?: VerifiedRegistrationResponse;
  webAuthnPublicKeyCredentialId?: string;
  retries?: number;
};

const sendCreateCredentialRequest = async (opts: {
  app: App;
  token: string | undefined;
  payload: z.input<typeof CreateCredentialBodySchema>;
}) => {
  const { app, token, payload } = opts;

  const requestInit = request(app).post('/api/credentials/create');
  if (token !== undefined) {
    requestInit.set('Authorization', `Bearer ${token}`);
  }

  const response = await requestInit
    .send(payload)
    .expect('Content-Type', /json/);

  return response;
};

export const performPublicKeyCredentialRegistrationAndVerify = async (
  opts: PerformPublicKeyCredentialRegistrationAndVerifyArgs,
): Promise<PerformPublicKeyCredentialRegistrationAndVerifyResult> => {
  const { app, token, payload, expectStatus, skipStateFlow = false } = opts;

  if (skipStateFlow) {
    const response = await sendCreateCredentialRequest({
      app,
      token,
      payload,
    });

    expect(response.status).toBe(expectStatus);

    return { response };
  }

  let retries = -1;
  let prevStateToken: string | undefined;
  let nextState: RegistrationState = {};
  let response: Response;

  while (true) {
    retries++;

    const currentPayload = {
      ...payload,
      prevStateToken,
      nextState,
    };

    response = await sendCreateCredentialRequest({
      app,
      token,
      payload: currentPayload,
    });

    if (response.status === 200) {
      break;
    }

    if (response.status === expectStatus && expectStatus !== 200) {
      return { response, retries };
    }

    const stateUpdate = match(response.body)
      .when(isExceptionShape(UserPresenceRequiredAgentException), (error) => ({
        stateToken: error.data.stateToken,
        nextState: { ...nextState, up: true } satisfies RegistrationState,
      }))
      .when(
        isExceptionShape(UserVerificationRequiredAgentException),
        (error) => ({
          stateToken: error.data.stateToken,
          nextState: { ...nextState, uv: true } satisfies RegistrationState,
        }),
      )
      .otherwise(() => {
        throw new Error(
          `Unexpected response status ${response.status}: ${JSON.stringify(response.body)}`,
        );
      });

    prevStateToken = stateUpdate.stateToken;
    nextState = stateUpdate.nextState;
  }

  const verification = await verifyRegistrationResponse({
    response: response.body as RegistrationResponseJSON,
    expectedChallenge: payload.publicKeyCredentialCreationOptions.challenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification:
      payload.publicKeyCredentialCreationOptions.authenticatorSelection
        ?.userVerification === UserVerification.REQUIRED,
    requireUserPresence: true,
  });

  expect(verification.verified).toBe(true);
  expect(verification.registrationInfo?.credential.counter).toBe(0);

  expect(response.body).toStrictEqual({
    authenticatorAttachment: 'platform',
    clientExtensionResults: {},
    id: expect.any(String),
    rawId: expect.any(String),
    response: {
      attestationObject: expect.any(String),
      clientDataJSON: expect.any(String),
      transports: ['internal'],
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
    retries,
  };
};
