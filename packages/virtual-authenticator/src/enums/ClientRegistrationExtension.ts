import type { ValueOfEnum } from '@repo/types';

/**
 * @see https://www.w3.org/TR/webauthn-3/#registration-extension
 * @see https://www.w3.org/TR/webauthn-3/#client-extension
 *
 * Every extension is a client extension, meaning that the extension involves communication with and processing by the client.
 *
 * Registration extension is invoked during the `navigator.credentials.create()` call.
 * It defines extension request parameters and response values specific to generating a public key credential.
 */
export const ClientRegistrationExtension = {
  credProps: 'credProps',
} as const;

export type ClientRegistrationExtension = ValueOfEnum<
  typeof ClientRegistrationExtension
>;
