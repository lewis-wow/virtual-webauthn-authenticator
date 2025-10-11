/**
 * A generic dictionary representing the client extension results, which provide
 * additional, optional data from the WebAuthn ceremony.
 */
export interface IAuthenticationExtensionsClientOutputs {
  [key: string]: unknown;
}
