import type {
  AuthenticatorTransport,
  COSEAlgorithmIdentifier,
} from '@repo/enums';
import type { Base64URLString } from './Base64URLString.js';

/**
 * A specific JSON representation of an authenticator's response during a
 * **registration** ceremony, providing more detail than the generic response.
 */
export interface IAuthenticatorAttestationResponseJSON {
  /** A Base64URL-encoded string of the client data. */
  clientDataJSON: Base64URLString;
  /** A Base64URL-encoded string of the attestation object. */
  attestationObject?: Base64URLString;
  /** An optional, decoded Base64URL-encoded string of the authenticator data. */
  authenticatorData?: Base64URLString;
  /** The transports the authenticator is believed to support. */
  transports?: AuthenticatorTransport[];
  /** The algorithm used for the public key. */
  publicKeyAlgorithm?: COSEAlgorithmIdentifier;
  /** A Base64URL-encoded string of the public key. */
  publicKey?: Base64URLString;
}
