import { USER_ID } from '@repo/auth/__tests__/helpers';
import {
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { GetCredentialBodySchema } from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { UUIDMapper } from '@repo/core/mappers';
import { isExceptionShape } from '@repo/exception';
import {
  CredentialSelectAgentException,
  UserPresenceRequiredAgentException,
  UserVerificationRequiredAgentException,
} from '@repo/virtual-authenticator/authenticatorAgent';
import {
  PublicKeyCredentialType,
  UserVerification,
} from '@repo/virtual-authenticator/enums';
import type { AuthenticationState } from '@repo/virtual-authenticator/state';
import {
  AuthenticationResponseJSON,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import request, { type Response } from 'supertest';
import { App } from 'supertest/types';
import { match } from 'ts-pattern';
import { expect } from 'vitest';
import z from 'zod';

export type PerformPublicKeyCredentialRequestAndVerifyArgs = {
  app: App;
  token: string | undefined;
  payload: z.input<typeof GetCredentialBodySchema>;
  registrationVerification: VerifiedRegistrationResponse;
  expectStatus: number;
  /**
   * When true, skips the state token retry loop.
   * Useful for testing state-related error responses directly.
   * @default false
   */
  skipStateFlow?: boolean;

  expectedNewCounter?: number;
};

export type PerformPublicKeyCredentialRequestAndVerifyResult = {
  response: Response;
  verification?: VerifiedAuthenticationResponse;
  webAuthnPublicKeyCredentialId?: string;
  retries?: number;
};

const sendGetCredentialRequest = async (opts: {
  app: App;
  token: string | undefined;
  payload: z.input<typeof GetCredentialBodySchema>;
}) => {
  const { app, token, payload } = opts;

  const requestInit = request(app).post(
    nestjsContract.api.credentials.get.path,
  );
  if (token !== undefined) {
    requestInit.set('Authorization', `Bearer ${token}`);
  }

  return await requestInit.send(payload).expect('Content-Type', /json/);
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
    skipStateFlow = false,
  } = opts;

  const {
    id: webAuthnPublicKeyCredentialId,
    publicKey: credentialPublicKey,
    counter,
  } = registrationVerification.registrationInfo!.credential;

  if (skipStateFlow) {
    const response = await sendGetCredentialRequest({
      app,
      token,
      payload,
    });

    expect(response.status).toBe(expectStatus);

    return { response };
  }

  // Handle state token retry loop
  let retries = -1;
  let prevStateToken: string | undefined;
  let nextState: AuthenticationState = {};
  let response: Response;

  while (true) {
    retries++;

    const currentPayload = {
      ...payload,
      prevStateToken,
      nextState,
    };

    response = await sendGetCredentialRequest({
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
      .when(isExceptionShape(CredentialSelectAgentException), (error) => ({
        stateToken: error.data.stateToken,
        nextState: {
          ...nextState,
          credentialId: error.data.credentialOptions[0]!.id,
        } satisfies AuthenticationState,
      }))
      .when(isExceptionShape(UserPresenceRequiredAgentException), (error) => ({
        stateToken: error.data.stateToken,
        nextState: {
          ...nextState,
          up: true,
        } satisfies AuthenticationState,
      }))
      .when(
        isExceptionShape(UserVerificationRequiredAgentException),
        (error) => ({
          stateToken: error.data.stateToken,
          nextState: {
            ...nextState,
            uv: true,
          } satisfies AuthenticationState,
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

  return {
    response,
    verification,
    webAuthnPublicKeyCredentialId,
    retries,
  };
};
