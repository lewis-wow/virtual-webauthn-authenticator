import type { Base64URLString } from '../Base64URLString.js';

/**
 * Represents the parsed `clientDataJSON` data. This object contains contextual
 * information about the WebAuthn ceremony.
 */
export interface ICollectedClientData {
  /** The type of WebAuthn operation, either registration or authentication. */
  type: 'webauthn.create' | 'webauthn.get';
  /** The challenge that was sent from the server to prevent replay attacks. */
  challenge: Base64URLString;
  /** The origin (domain) where the WebAuthn operation was initiated. */
  origin: string;
  /** Indicates if the operation was cross-origin. */
  crossOrigin?: boolean;
  /**
   * Information about token binding, used to cryptographically bind the
   * authentication to the TLS connection. Often omitted.
   */
  tokenBinding?: {
    status: 'present' | 'supported';
    id?: string;
  };
}
