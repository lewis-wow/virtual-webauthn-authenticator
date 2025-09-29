import { ValueOf } from '../types.js';

/**
 * @see https://w3c.github.io/webauthn/#enum-attachment
 */
export const AuthenticatorAttachment = {
  PLATFORM: 'platform',
  CROSS_PLATFORM: 'cross-platform',
} as const;

export type AuthenticatorAttachment = ValueOf<typeof AuthenticatorAttachment>;
