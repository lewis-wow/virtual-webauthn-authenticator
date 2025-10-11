import type { AuthenticatorAttachment } from './AuthenticatorAttachment.js';
import type { Base64URLString } from './Base64URLString.js';
import type { IAuthenticationExtensionsClientOutputs } from './IAuthenticationExtensionsClientOutputs.js';
import type { IAuthenticatorAssertionResponse } from './IAuthenticatorAssertionResponse.js';
import type { IAuthenticatorAttestationResponse } from './IAuthenticatorAttestationResponse.js';
import type { PublicKeyCredentialType } from './PublicKeyCredentialType.js';

/**
 * Represents a complete `PublicKeyCredential` object on the server. This is the
 * primary data structure for holding a credential after it has been received and
 * parsed from the client, but before it is serialized for storage.
 */
export interface IPublicKeyCredential {
  /** The unique, Base64URL-encoded ID for this credential. */
  id: Base64URLString;
  /** The raw binary version of the credential ID. */
  rawId: Buffer;
  /** The authenticator's response, either for registration or authentication. */
  response: IAuthenticatorAttestationResponse | IAuthenticatorAssertionResponse;
  /** The type of credential, which is always 'public-key' for WebAuthn. */
  type: PublicKeyCredentialType;
  /** The client extension results from the ceremony. */
  clientExtensionResults: IAuthenticationExtensionsClientOutputs;
  /** The attachment type of the authenticator, if known. */
  authenticatorAttachment: AuthenticatorAttachment | null;
  // /** A method to retrieve the client extension results. */
  // getClientExtensionResults(): IAuthenticationExtensionsClientOutputs;
  // /** A method to convert the credential into a JSON-serializable format. */
  // toJSON(): IRegistrationResponseJSON;
}
