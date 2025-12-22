import type { ValueOfEnum } from '@repo/types';

/**
 * This enumeration's values describe authenticators' attachment modalities.
 * @see https://www.w3.org/TR/webauthn-3/#enum-attachment
 */
export const AuthenticatorAttachment = {
  /**
   * Platform attachment. Indicates that the authenticator is attached using
   * a client device-specific transport (e.g., Touch ID, Face ID, Windows Hello).
   * These authenticators are usually not removable from the client device.
   */
  PLATFORM: 'platform',
  /**
   * Cross-platform attachment. Indicates that the authenticator is removable
   * from, and can "roam" among, client devices (e.g., USB security keys).
   */
  CROSS_PLATFORM: 'cross-platform',
} as const;

export type AuthenticatorAttachment = ValueOfEnum<
  typeof AuthenticatorAttachment
>;
