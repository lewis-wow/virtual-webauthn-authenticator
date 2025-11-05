import z from 'zod';

import { IsoDatetimeToDateSchema } from '../../transformers/IsoDatetimeToDateSchema';

export const WebAuthnCredentialKeyVaultKeyMetaSchema = z
  .object({
    id: z.uuid(),
    keyVaultKeyId: z.string().nullable(),
    keyVaultKeyName: z.string(),
    hsm: z.boolean(),
    createdAt: IsoDatetimeToDateSchema,
    updatedAt: IsoDatetimeToDateSchema,
  })
  .meta({
    id: 'WebAuthnCredentialKeyVaultKeyMeta',
    ref: 'WebAuthnCredentialKeyVaultKeyMeta',
  });

export type WebAuthnCredentialKeyVaultKeyMeta = z.infer<
  typeof WebAuthnCredentialKeyVaultKeyMetaSchema
>;
