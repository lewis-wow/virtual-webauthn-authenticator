import type { ValueOfEnum } from '@repo/types';

export const AuthenticatorGetAssertionEnvelopeStatus = {
  SUCCESS: 'SUCCESS',
  INTERACTION_REQUIRED: 'INTERACTION_REQUIRED',
} as const;

export type AuthenticatorGetAssertionEnvelopeStatus = ValueOfEnum<
  typeof AuthenticatorGetAssertionEnvelopeStatus
>;
