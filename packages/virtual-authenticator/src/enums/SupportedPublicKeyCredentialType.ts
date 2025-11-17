import type { ValueOfEnum } from '@repo/types';

/**
 * @see https://w3c.github.io/webauthn/#enum-credentialType
 */
export const SupportedPublicKeyCredentialType = {
  PUBLIC_KEY: 'public-key',
} as const;

export type SupportedPublicKeyCredentialType = ValueOfEnum<
  typeof SupportedPublicKeyCredentialType
>;
