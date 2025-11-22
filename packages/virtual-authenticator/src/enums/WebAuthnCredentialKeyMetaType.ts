import type { ValueOfEnum } from '@repo/types';

export const WebAuthnCredentialKeyMetaType = {
  KEY_VAULT: 'KEY_VAULT',
} as const;

export type WebAuthnCredentialKeyMetaType = ValueOfEnum<
  typeof WebAuthnCredentialKeyMetaType
>;
