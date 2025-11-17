import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

export const WebAuthnCredentialKeyMetaType = {
  KEY_VAULT: 'KEY_VAULT',
} as const;

export type WebAuthnCredentialKeyMetaType = ValueOfEnum<
  typeof WebAuthnCredentialKeyMetaType
>;

export const WebAuthnCredentialKeyMetaTypeSchema = z
  .enum(WebAuthnCredentialKeyMetaType)
  .meta({
    description: 'WebAuthn Credential Key Meta Type',
    examples: [WebAuthnCredentialKeyMetaType.KEY_VAULT],
  });
