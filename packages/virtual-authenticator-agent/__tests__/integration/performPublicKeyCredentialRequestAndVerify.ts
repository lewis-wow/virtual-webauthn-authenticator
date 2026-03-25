import { USER_ID } from '@repo/auth/__tests__/helpers';
import {
  RP_ORIGIN,
  VIRTUAL_AUTHENTICATOR_ID,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { toBase64Url } from '@repo/utils';
import { parseAuthenticatorData } from '@repo/virtual-authenticator/cbor';
import { PublicKeyCredentialDtoSchema } from '@repo/virtual-authenticator/dto';
import { UserVerification } from '@repo/virtual-authenticator/enums';
import { VirtualAuthenticatorUserVerificationType } from '@repo/virtual-authenticator/enums';
import type { AuthenticationState } from '@repo/virtual-authenticator/state';
import { StateManager } from '@repo/virtual-authenticator/state';
import type { AuthenticatorAssertionResponse } from '@repo/virtual-authenticator/validation';
import type { PublicKeyCredentialRequestOptions } from '@repo/virtual-authenticator/validation';
import type { PublicKeyCredential } from '@repo/virtual-authenticator/validation';
import {
  type AuthenticationResponseJSON,
  verifyAuthenticationResponse,
  type WebAuthnCredential,
} from '@simplewebauthn/server';
import { expect } from 'vitest';

import { VirtualAuthenticatorAgent } from '../../src/VirtualAuthenticatorAgent';
import { UserPresenceRequiredAgentException } from '../../src/exceptions/UserPresenceRequiredAgentException';
import { UserVerificationRequiredAgentException } from '../../src/exceptions/UserVerificationRequiredAgentException';
import type { AuthenticatorAgentMetaArgs } from '../../src/validation/AuthenticatorAgentMetaArgsSchema';

export type PerformPublicKeyCredentialRequestAndVerifyArgs = {
  stateManager: StateManager;
  agent: VirtualAuthenticatorAgent;
  publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions;
  webAuthnCredential: WebAuthnCredential;
  meta?: Partial<AuthenticatorAgentMetaArgs>;
  uvState?: { pin?: string };
};

export const performPublicKeyCredentialRequestAndVerify = async (
  opts: PerformPublicKeyCredentialRequestAndVerifyArgs,
) => {
  const {
    agent,
    publicKeyCredentialRequestOptions,
    webAuthnCredential,
    meta: metaOptions,
    uvState = { pin: undefined },
  } = opts;

  const meta: AuthenticatorAgentMetaArgs = {
    userId: USER_ID,
    virtualAuthenticatorId: VIRTUAL_AUTHENTICATOR_ID,
    apiKeyId: null,
    origin: RP_ORIGIN,

    userPresenceEnabled: true,
    userVerificationEnabled: true,
    userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
    ...metaOptions,
  };

  const expectedRPID =
    publicKeyCredentialRequestOptions.rpId ?? new URL(meta.origin).hostname;

  // Simulate the full WebAuthn authentication ceremony.
  let retries = -1;
  let publicKeyCredential: PublicKeyCredential | undefined;
  let prevStateToken: string | undefined;
  let nextState: AuthenticationState = {};

  while (!publicKeyCredential) {
    retries++;
    try {
      publicKeyCredential = await agent.getAssertion({
        origin: meta.origin,
        options: {
          publicKey: publicKeyCredentialRequestOptions,
        },
        sameOriginWithAncestors: true,

        // Internal options
        meta,
        prevStateToken,
        nextState,
      });
    } catch (error) {
      if (error instanceof UserPresenceRequiredAgentException) {
        prevStateToken = error.data.stateToken;

        nextState = {
          ...nextState,
          up: true,
        };
      } else if (error instanceof UserVerificationRequiredAgentException) {
        prevStateToken = error.data.stateToken;

        nextState = {
          ...nextState,
          uv: uvState,
        };
      } else {
        throw error;
      }
    }
  }

  if (!publicKeyCredential) {
    throw new Error('Failed to get assertion.');
  }

  const authenticationVerificationResponse = await verifyAuthenticationResponse(
    {
      response: PublicKeyCredentialDtoSchema.encode(
        publicKeyCredential,
      ) as AuthenticationResponseJSON,
      expectedChallenge: toBase64Url(
        publicKeyCredentialRequestOptions.challenge,
      ),
      expectedOrigin: meta.origin,
      expectedRPID,
      credential: webAuthnCredential,
      requireUserVerification:
        publicKeyCredentialRequestOptions.userVerification ===
        UserVerification.REQUIRED,
    },
  );

  const parsedAuthenticatorData = parseAuthenticatorData(
    (publicKeyCredential.response as AuthenticatorAssertionResponse)
      .authenticatorData,
  );

  // The most important check: confirm that the authentication was successful.
  expect(authenticationVerificationResponse.verified).toBe(true);

  expect(
    authenticationVerificationResponse.authenticationInfo.credentialID,
  ).toBe(webAuthnCredential.id);

  return {
    parsedAuthenticatorData,
    authenticationVerificationResponse,
    publicKeyCredential,
    retries,
  };
};
