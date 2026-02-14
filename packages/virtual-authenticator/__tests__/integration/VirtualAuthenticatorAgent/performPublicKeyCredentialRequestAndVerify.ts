import { USER_ID } from '../../../../auth/__tests__/helpers';

import { toB64 } from '@repo/utils';
import {
  type AuthenticationResponseJSON,
  verifyAuthenticationResponse,
  type WebAuthnCredential,
} from '@simplewebauthn/server';
import { expect } from 'vitest';

import { VirtualAuthenticatorAgent } from '../../../src/agent/VirtualAuthenticatorAgent';
import { UserPresenceRequiredAgentException } from '../../../src/agent/exceptions/UserPresenceRequiredAgentException';
import { UserVerificationRequiredAgentException } from '../../../src/agent/exceptions/UserVerificationRequiredAgentException';
import { parseAuthenticatorData } from '../../../src/cbor/parseAuthenticatorData';
import { PublicKeyCredentialDtoSchema } from '../../../src/dto/spec/PublicKeyCredentialDtoSchema';
import { UserVerification } from '../../../src/enums/UserVerification';
import type { AuthenticationState } from '../../../src/state/AuthenticationStateSchema';
import { StateManager } from '../../../src/state/StateManager';
import type { AuthenticatorAgentMetaArgs } from '../../../src/validation/authenticatorAgent/AuthenticatorAgentMetaArgsSchema';
import type { AuthenticatorAssertionResponse } from '../../../src/validation/spec/AuthenticatorAssertionResponseSchema';
import type { PublicKeyCredentialRequestOptions } from '../../../src/validation/spec/PublicKeyCredentialRequestOptionsSchema';
import type { PublicKeyCredential } from '../../../src/validation/spec/PublicKeyCredentialSchema';
import { RP_ORIGIN } from '../../helpers/consts';

export type PerformPublicKeyCredentialRequestAndVerifyArgs = {
  stateManager: StateManager;
  agent: VirtualAuthenticatorAgent;
  publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions;
  webAuthnCredential: WebAuthnCredential;
  meta?: Partial<AuthenticatorAgentMetaArgs>;
};

export const performPublicKeyCredentialRequestAndVerify = async (
  opts: PerformPublicKeyCredentialRequestAndVerifyArgs,
) => {
  const {
    agent,
    publicKeyCredentialRequestOptions,
    webAuthnCredential,
    meta: metaOptions,
  } = opts;

  const meta: AuthenticatorAgentMetaArgs = {
    userId: USER_ID,
    apiKeyId: null,
    origin: RP_ORIGIN,

    userPresenceEnabled: true,
    userVerificationEnabled: true,
    ...metaOptions,
  };

  // NOTE: This property name should be `state` but generic context passing is kept for legacy compatibility?
  // Ideally we construct initial state here if needed, but usually agent handles initial call without state.
  // The original code passed `context`, but `getAssertion` expects `state`.
  // Wait, `AuthenticatorAgentContextArgs` seems unrelated to `AuthenticationState`.
  // Let's assume `context` argument was intended to pre-populate state.
  // We'll ignore `context` for state construction unless retrying.

  const expectedRPID =
    publicKeyCredentialRequestOptions.rpId ?? new URL(meta.origin).hostname;

  // Simulate the full WebAuthn authentication ceremony.
  let publicKeyCredential: PublicKeyCredential | undefined;
  let prevStateToken: string | undefined;
  let nextState: AuthenticationState = {};

  while (!publicKeyCredential) {
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
          uv: true,
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
      expectedChallenge: toB64(publicKeyCredentialRequestOptions.challenge),
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
  };
};
