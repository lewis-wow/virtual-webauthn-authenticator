import type { AuthenticatorTransportFuture } from './AuthenticatorTransportFuture.js';
import type { PublicKeyCredentialType } from './PublicKeyCredentialType.js';

/**
 * Describes a `PublicKeyCredential` that can be used for authentication.
 */
export interface IPublicKeyCredentialDescriptor {
  /** The type of the credential, which is always 'public-key' for WebAuthn. */
  type: PublicKeyCredentialType;
  /** The ID of the credential. */
  id: Buffer;
  /** The transports that can be used to authenticate with the credential. */
  transports?: AuthenticatorTransportFuture[];
}
