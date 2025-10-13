import type {
  AuthenticatorAttachment,
  PublicKeyCredentialType,
} from '@repo/enums';

import type { Base64URLString } from '../Base64URLString.js';
import type { IAuthenticationExtensionsClientOutputs } from './IAuthenticationExtensionsClientOutputs.js';
import type { IAuthenticatorAttestationResponseJSON } from './IAuthenticatorAttestationResponseJSON.js';

/**
 * The complete JSON representation of a credential after a successful **registration**.
 * This is often the object sent back to the client upon completion.
 */
export interface IRegistrationResponseJSON {
  /** The unique, Base64URL-encoded ID for this credential. */
  id: Base64URLString;
  /** A Base64URL-encoded string of the raw credential ID. */
  rawId: Base64URLString;
  /** The detailed JSON response from the authenticator for registration. */
  response: IAuthenticatorAttestationResponseJSON;
  /** The attachment type of the authenticator, if known. */
  authenticatorAttachment: AuthenticatorAttachment | null;
  /** The client extension results from the ceremony. */
  clientExtensionResults: IAuthenticationExtensionsClientOutputs;
  /** The type of credential, which is always 'public-key' for WebAuthn. */
  type: PublicKeyCredentialType;
}
