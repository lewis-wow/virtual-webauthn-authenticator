import z from 'zod';

import { DateSchemaCodec } from '../../dto/common/DateSchemaCodec';

export const WebAuthnCredentialKeyVaultKeyMetaSchema = z
  .object({
    id: z.uuid(),
    keyVaultKeyId: z.string().nullable(),
    keyVaultKeyName: z.string(),
    hsm: z.boolean(),
    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  })
  .meta({
    id: 'WebAuthnCredentialKeyVaultKeyMeta',
    ref: 'WebAuthnCredentialKeyVaultKeyMeta',
  });

export type WebAuthnCredentialKeyVaultKeyMeta = z.infer<
  typeof WebAuthnCredentialKeyVaultKeyMetaSchema
>;
