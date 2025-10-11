/**
 * A base interface for all authenticator responses, containing the mandatory
 * `clientDataJSON`.
 */
export interface IAuthenticatorResponse {
  /** The raw binary client data, containing the challenge, origin, etc. */
  clientDataJSON: Buffer;
}
