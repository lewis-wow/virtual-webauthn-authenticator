import z from 'zod';

import { DateSchemaCodec } from '../../codecs/DateSchemaCodec';

export const WebAuthnCredentialKeyVaultKeyMetaSchema = z
  .object({
    id: z.uuid(),
    keyVaultKeyId: z.string().nullable(),
    keyVaultKeyName: z.string(),
    hsm: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .meta({
    id: 'WebAuthnCredentialKeyVaultKeyMeta',
    ref: 'WebAuthnCredentialKeyVaultKeyMeta',
  });

export const WebAuthnCredentialKeyVaultKeyMetaSchemaCodec =
  WebAuthnCredentialKeyVaultKeyMetaSchema.extend({
    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  });

export type WebAuthnCredentialKeyVaultKeyMeta = z.infer<
  typeof WebAuthnCredentialKeyVaultKeyMetaSchema
>;
