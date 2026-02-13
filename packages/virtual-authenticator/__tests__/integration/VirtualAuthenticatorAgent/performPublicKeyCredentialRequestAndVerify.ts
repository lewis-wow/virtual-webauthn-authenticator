import { USER_ID } from '../../../../auth/__tests__/helpers';

import { toB64 } from '@repo/utils';
import {
  type AuthenticationResponseJSON,
  verifyAuthenticationResponse,
  type WebAuthnCredential,
} from '@simplewebauthn/server';
import { expect } from 'vitest';

import { VirtualAuthenticatorAgent } from '../../../src/agent/VirtualAuthenticatorAgent';
import type { AuthenticationStateWithToken } from '../../../src/agent/state/AuthenticationStateAgentSchema';
import { parseAuthenticatorData } from '../../../src/cbor/parseAuthenticatorData';
import { PublicKeyCredentialDtoSchema } from '../../../src/dto/spec/PublicKeyCredentialDtoSchema';
import { UserVerification } from '../../../src/enums/UserVerification';
import type { AuthenticatorAgentMetaArgs } from '../../../src/validation/authenticatorAgent/AuthenticatorAgentMetaArgsSchema';
import type { AuthenticatorAssertionResponse } from '../../../src/validation/spec/AuthenticatorAssertionResponseSchema';
import type { PublicKeyCredentialRequestOptions } from '../../../src/validation/spec/PublicKeyCredentialRequestOptionsSchema';
import { RP_ORIGIN } from '../../helpers/consts';

export type PerformPublicKeyCredentialRequestAndVerifyArgs = {
  agent: VirtualAuthenticatorAgent;
  publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions;
  webAuthnCredential: WebAuthnCredential;
  meta?: Partial<AuthenticatorAgentMetaArgs>;
  state?: AuthenticationStateWithToken;
};

export const performPublicKeyCredentialRequestAndVerify = async (
  opts: PerformPublicKeyCredentialRequestAndVerifyArgs,
) => {
  const {
    agent,
    publicKeyCredentialRequestOptions,
    webAuthnCredential,
    meta: metaOptions,
    state,
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

  const publicKeyCredential = await agent.getAssertion({
    origin: meta.origin,
    options: {
      publicKey: publicKeyCredentialRequestOptions,
    },
    sameOriginWithAncestors: true,

    // Internal options
    meta,
    state,
  });

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
