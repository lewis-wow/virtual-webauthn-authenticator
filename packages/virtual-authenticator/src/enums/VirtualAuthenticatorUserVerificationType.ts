import type { ValueOfEnum } from '@repo/types';

export const VirtualAuthenticatorUserVerificationType = {
  NONE: 'NONE',
  PIN: 'PIN',
} as const;

export type VirtualAuthenticatorUserVerificationType = ValueOfEnum<
  typeof VirtualAuthenticatorUserVerificationType
>;
