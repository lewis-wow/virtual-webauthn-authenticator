import type { ValueOf } from '@repo/types';

/**
 * @see https://w3c.github.io/webauthn/#enum-transport
 */
export const AuthenticatorTransport = {
  USB: 'usb',
  NFC: 'nfc',
  BLE: 'ble',
  HYBRID: 'hybrid',
  INTERNAL: 'internal',
} as const;

export type AuthenticatorTransport = ValueOf<typeof AuthenticatorTransport>;
