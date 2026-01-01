import type { ValueOfEnum } from '@repo/types';

/**
 * This enumeration defines the valid credential types. It is an extension point;
 * values can be added to it in the future, as more credential types are defined.
 * @see https://www.w3.org/TR/webauthn-3/#enum-credentialType
 */
export const PublicKeyCredentialType = {
  /**
   * The only currently defined credential type. Indicates a credential based on
   * an asymmetric key pair, used for WebAuthn authentication.
   */
  PUBLIC_KEY: 'public-key',
} as const;

export type PublicKeyCredentialType = ValueOfEnum<
  typeof PublicKeyCredentialType
>;
