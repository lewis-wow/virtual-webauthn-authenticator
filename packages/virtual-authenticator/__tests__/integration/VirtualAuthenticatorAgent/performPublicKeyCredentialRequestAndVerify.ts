import { USER_ID } from '../../../../auth/__tests__/helpers';

import type { Uint8Array_ } from '@repo/types';
import {
  type AuthenticationResponseJSON,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { expect } from 'vitest';

import { VirtualAuthenticatorAgent } from '../../../src/VirtualAuthenticatorAgent';
import { PublicKeyCredentialOrApplicablePublicKeyCredentialsListDtoSchema } from '../../../src/dto/spec/PublicKeyCredentialOrApplicablePublicKeyCredentialsListDtoSchema';
import { UserVerification } from '../../../src/enums/UserVerification';
import type { PublicKeyCredentialRequestOptions } from '../../../src/validation';
import { CHALLENGE_BASE64URL, RP_ID, RP_ORIGIN } from '../../helpers/consts';

export type PerformPublicKeyCredentialRequestAndVerifyArgs = {
  agent: VirtualAuthenticatorAgent;

  publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions;
  webAuthnPublicKeyCredentialId: string;
  publicKey: Uint8Array_;
  counter: number;
  expectedNewCounter?: number;
  expectedChallenge?: string;
  userId?: string;
  origin?: string;
};

export type PerformPublicKeyCredentialRequestAndVerifyResult = {
  authenticationVerification: Awaited<
    ReturnType<typeof verifyAuthenticationResponse>
  >;
};

export const performPublicKeyCredentialRequestAndVerify = async (
  opts: PerformPublicKeyCredentialRequestAndVerifyArgs,
): Promise<PerformPublicKeyCredentialRequestAndVerifyResult> => {
  const {
    agent,
    publicKeyCredentialRequestOptions,
    webAuthnPublicKeyCredentialId,
    publicKey,
    counter,
    expectedNewCounter,
    expectedChallenge = CHALLENGE_BASE64URL,
    userId = USER_ID,
    origin = RP_ORIGIN,
  } = opts;

  const publicKeyCredential = await agent.getAssertion({
    origin,
    options: {
      publicKey: publicKeyCredentialRequestOptions,
    },
    sameOriginWithAncestors: true,

    // Internal options
    meta: {
      userId,
      apiKeyId: null,
      origin,

      userPresenceEnabled: true,
      userVerificationEnabled: true,
    },
    context: {},
  });

  const authenticationVerification = await verifyAuthenticationResponse({
    response:
      PublicKeyCredentialOrApplicablePublicKeyCredentialsListDtoSchema.encode(
        publicKeyCredential,
      ) as AuthenticationResponseJSON,
    expectedChallenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: webAuthnPublicKeyCredentialId,
      publicKey: publicKey,
      counter,
    },
    requireUserVerification:
      publicKeyCredentialRequestOptions.userVerification ===
      UserVerification.REQUIRED,
  });

  // The most important check: confirm that the authentication was successful.
  expect(authenticationVerification.verified).toBe(true);

  // A critical security check: ensure the signature counter has incremented (if expected).
  if (expectedNewCounter !== undefined) {
    expect(authenticationVerification.authenticationInfo.newCounter).toBe(
      expectedNewCounter,
    );
  }

  return { authenticationVerification };
};
