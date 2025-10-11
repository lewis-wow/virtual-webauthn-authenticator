/**
 * A generic dictionary representing the client extension inputs, which provide
 * additional, optional data to the WebAuthn ceremony.
 */
export interface IAuthenticationExtensionsClientInputs {
  [key: string]: unknown;
}
