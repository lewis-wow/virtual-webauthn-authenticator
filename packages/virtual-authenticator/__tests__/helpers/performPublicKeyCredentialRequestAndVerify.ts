import { USER_ID } from '../../../auth/__tests__/helpers';

import {
  AuthenticationResponseJSON,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { expect } from 'vitest';

import { PublicKeyCredentialDtoSchema } from '../../../contract/src/dto/credentials/components/PublicKeyCredentialDtoSchema';
import { VirtualAuthenticatorAgent } from '../../src/VirtualAuthenticatorAgent';
import { PublicKeyCredentialRequestOptions } from '../../src/zod-validation';
import { CHALLENGE_BASE64URL, RP_ID, RP_ORIGIN } from './consts';

export type PerformPublicKeyCredentialRequestAndVerifyArgs = {
  agent: VirtualAuthenticatorAgent;

  publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions;
  webAuthnCredentialId: string;
  publicKey: Uint8Array<ArrayBuffer>;
  counter: number;
  expectedNewCounter?: number;
  requireUserVerification?: boolean;
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
    webAuthnCredentialId,
    publicKey,
    counter,
    expectedNewCounter,
    requireUserVerification,
    expectedChallenge = CHALLENGE_BASE64URL,
    userId = USER_ID,
    origin = RP_ORIGIN,
  } = opts;

  const publicKeyCredential = await agent.getAssertion({
    credentialRequestOptions: {
      publicKey: publicKeyCredentialRequestOptions,
    },
    meta: {
      userId,
      origin,
    },
    context: {
      apiKeyId: null,
    },
  });

  const authenticationVerification = await verifyAuthenticationResponse({
    response: PublicKeyCredentialDtoSchema.encode(
      publicKeyCredential,
    ) as AuthenticationResponseJSON,
    expectedChallenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: webAuthnCredentialId,
      publicKey,
      counter,
    },
    requireUserVerification:
      requireUserVerification ??
      publicKeyCredentialRequestOptions.userVerification === 'required',
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
