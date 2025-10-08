import type { ValueOf } from '@repo/types';

export const AuthenticatorAttachment = {
  CROSS_PLATFORM: 'cross-platform',
  PLATFORM: 'platform',
} as const;

export type AuthenticatorAttachment = ValueOf<typeof AuthenticatorAttachment>;
