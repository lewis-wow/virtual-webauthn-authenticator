import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

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
