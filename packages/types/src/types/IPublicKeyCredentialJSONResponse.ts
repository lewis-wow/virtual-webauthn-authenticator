import type { Base64URLString } from './Base64URLString.js';

/**
 * A generic JSON representation of the `response` part of a PublicKeyCredential.
 * It includes all possible fields from both attestation and assertion responses.
 */
export interface IPublicKeyCredentialJSONResponse {
  /** A Base64URL-encoded string of the client data. */
  clientDataJSON: Base64URLString;
  /** A Base64URL-encoded string of the attestation object (for registration). */
  attestationObject?: Base64URLString;
  /** A Base64URL-encoded string of the authenticator data. */
  authenticatorData?: Base64URLString;
  /** A Base64URL-encoded string of the signature (for authentication). */
  signature?: Base64URLString;
  /** A Base64URL-encoded string of the user handle (for authentication). */
  userHandle?: Base64URLString;
}
