import type { ValueOf } from '@repo/types';

/**
 * @see https://w3c.github.io/webauthn/#enum-credentialType
 */
export const PublicKeyCredentialType = {
  PUBLIC_KEY: 'public-key',
} as const;

export type PublicKeyCredentialType = ValueOf<typeof PublicKeyCredentialType>;
