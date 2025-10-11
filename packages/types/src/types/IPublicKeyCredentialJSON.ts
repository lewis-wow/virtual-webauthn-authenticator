import type { AuthenticatorAttachment } from './AuthenticatorAttachment.js';
import type { Base64URLString } from './Base64URLString.js';
import type { IAuthenticationExtensionsClientOutputs } from './IAuthenticationExtensionsClientOutputs.js';
import type { IPublicKeyCredentialJSONResponse } from './IPublicKeyCredentialJSONResponse.js';
import type { PublicKeyCredentialType } from './PublicKeyCredentialType.js';

/**
 * A generic JSON-serializable representation of a `PublicKeyCredential`.
 * This interface is suitable for storing credentials in a database or for
 * general-purpose data transfer.
 */
export interface IPublicKeyCredentialJSON {
  /** The unique, Base64URL-encoded ID for this credential. */
  id: Base64URLString;
  /** A Base64URL-encoded string of the raw credential ID. */
  rawId: Base64URLString;
  /** The type of credential, which is always 'public-key' for WebAuthn. */
  type: PublicKeyCredentialType;
  /** The client extension results from the ceremony. */
  clientExtensionResults: IAuthenticationExtensionsClientOutputs;
  /** The attachment type of the authenticator, if known. */
  authenticatorAttachment: AuthenticatorAttachment | null;
  /** The JSON representation of the authenticator's response. */
  response: IPublicKeyCredentialJSONResponse;
}
