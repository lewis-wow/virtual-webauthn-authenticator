import type { ValueOfEnum } from '@repo/types';

/**
 * @see https://www.w3.org/TR/webauthn-3/#authentication-extension
 * @see https://www.w3.org/TR/webauthn-3/#authenticator-extension
 *
 * An extension can also be an authenticator extension, meaning that the extension involves communication with and processing by the authenticator.
 *
 * Authentication extension is invoked during the `navigator.credentials.get()` call.
 * It defines extension request parameters and response values specific to requesting an authentication assertion.
 */
export const AuthenticatorAuthenticationExtension = {} as const;

export type AuthenticatorAuthenticationExtension = ValueOfEnum<
  typeof AuthenticatorAuthenticationExtension
>;
