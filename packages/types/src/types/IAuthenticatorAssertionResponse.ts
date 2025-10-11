import type { IAuthenticatorResponse } from './IAuthenticatorResponse.js';

/**
 * The authenticator's response during an authentication (`webauthn.get`) ceremony.
 * It contains the data needed to verify a user's identity.
 */
export interface IAuthenticatorAssertionResponse
  extends IAuthenticatorResponse {
  /** The raw binary authenticator data. */
  authenticatorData: Buffer;
  /** The cryptographic signature proving possession of the private key. */
  signature: Buffer;
  /** A handle to the user account, if provided by the authenticator. */
  userHandle: Buffer | null;
}
