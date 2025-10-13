import type { UserVerificationRequirement } from '@repo/enums';

import type { IAuthenticationExtensionsClientInputs } from './IAuthenticationExtensionsClientInputs.js';
import type { IPublicKeyCredentialDescriptor } from './IPublicKeyCredentialDescriptor.js';

/**
 * Represents the options for requesting a `PublicKeyCredential` from an
 * authenticator during the authentication (login) process.
 */
export interface IPublicKeyCredentialRequestOptions {
  /** A cryptographic challenge from the relying party's server. */
  challenge: Buffer;
  /** An optional list of credentials that can be used for authentication. */
  allowCredentials?: IPublicKeyCredentialDescriptor[];
  /** The maximum time (in milliseconds) to wait for user interaction. */
  timeout?: number;
  /** The relying party identifier. */
  rpId?: string;
  /** The requirements for user verification. */
  userVerification?: UserVerificationRequirement;
  /** Additional, optional data for the WebAuthn ceremony. */
  extensions?: IAuthenticationExtensionsClientInputs;
}
