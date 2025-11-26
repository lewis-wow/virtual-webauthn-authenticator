import type { ValueOfEnum } from '@repo/types';

/**
 * @see https://w3c.github.io/webauthn/#enum-attachment
 */
export const AuthenticatorAttachment = {
  PLATFORM: 'platform',
  CROSS_PLATFORM: 'cross-platform',
} as const;

export type AuthenticatorAttachment = ValueOfEnum<
  typeof AuthenticatorAttachment
>;
