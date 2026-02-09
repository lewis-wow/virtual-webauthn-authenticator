import type { ValueOfEnum } from '@repo/types';

/**
 * @see https://www.w3.org/TR/webauthn-3/#authentication-extension
 * @see https://www.w3.org/TR/webauthn-3/#client-extension
 *
 * Every extension is a client extension, meaning that the extension involves communication with and processing by the client.
 *
 * Authentication extension is invoked during the `navigator.credentials.get()` call.
 * It defines extension request parameters and response values specific to requesting an authentication assertion.
 */
export const ClientAuthenticationExtension = {
  HMAC_SECRET: 'hmac-secret',
} as const;

export type ClientAuthenticationExtension = ValueOfEnum<
  typeof ClientAuthenticationExtension
>;
