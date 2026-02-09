import type { ValueOfEnum } from '@repo/types';

/**
 * @see https://www.w3.org/TR/webauthn-3/#registration-extension
 * @see https://www.w3.org/TR/webauthn-3/#authenticator-extension
 *
 * An extension can also be an authenticator extension, meaning that the extension involves communication with and processing by the authenticator.
 *
 * Registration extension is invoked during the `navigator.credentials.create()` call.
 * It defines extension request parameters and response values specific to generating a public key credential.
 */
export const AuthenticatorRegistrationExtension = {
  HMAC_SECRET: 'hmac-secret',
} as const;

export type AuthenticatorRegistrationExtension = ValueOfEnum<
  typeof AuthenticatorRegistrationExtension
>;
