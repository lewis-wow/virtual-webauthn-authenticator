import type { ValueOf } from '@repo/types';

/**
 * Defines whether an authenticator is part of the client's platform (`platform`)
 * or a separate, roaming device (`cross-platform`).
 */
export const AuthenticatorAttachment = {
  CROSS_PLATFORM: 'cross-platform',
  PLATFORM: 'platform',
} as const;

export type AuthenticatorAttachment = ValueOf<typeof AuthenticatorAttachment>;
