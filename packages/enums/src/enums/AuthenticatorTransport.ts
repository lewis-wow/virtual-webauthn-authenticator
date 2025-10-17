import z from 'zod';

import type { ValueOfEnum } from '../types.js';

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

export type AuthenticatorTransport = ValueOfEnum<typeof AuthenticatorTransport>;

export const AuthenticatorTransportSchema = z
  .enum(AuthenticatorTransport)
  .meta({
    description: 'Authenticator transport',
    examples: [AuthenticatorTransport.USB],
  });
