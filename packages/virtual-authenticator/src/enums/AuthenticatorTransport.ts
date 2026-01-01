import type { ValueOfEnum } from '@repo/types';

/**
 * Authenticators may implement various transports for communicating with clients.
 * This enumeration defines hints as to how clients might communicate with a particular
 * authenticator in order to obtain an assertion for a specific credential.
 * @see https://www.w3.org/TR/webauthn-3/#enum-transport
 */
export const AuthenticatorTransport = {
  /**
   * Indicates the respective authenticator can be contacted over removable USB.
   */
  USB: 'usb',
  /**
   * Indicates the respective authenticator can be contacted over Near Field Communication (NFC).
   */
  NFC: 'nfc',
  /**
   * Indicates the respective authenticator can be contacted over Bluetooth Smart (Bluetooth Low Energy / BLE).
   */
  BLE: 'ble',
  /**
   * Indicates the respective authenticator can be contacted using a combination of (often separate)
   * data-transport and proximity mechanisms. This supports, for example, authentication on
   * a desktop computer using a smartphone.
   */
  HYBRID: 'hybrid',
  /**
   * Indicates the respective authenticator is contacted using a client device-specific transport,
   * i.e., it is a platform authenticator. These authenticators are not removable from the client device.
   */
  INTERNAL: 'internal',
} as const;

export type AuthenticatorTransport = ValueOfEnum<typeof AuthenticatorTransport>;
