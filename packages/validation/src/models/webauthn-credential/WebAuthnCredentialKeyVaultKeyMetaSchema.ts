import z from 'zod';

import { IsoDatetimeToDateCodecSchema } from '../../codecs/IsoDatetimeToDateCodecSchema';

export const WebAuthnCredentialKeyVaultKeyMetaSchema = z
  .object({
    id: z.uuid(),
    keyVaultKeyId: z.string().nullable(),
    keyVaultKeyName: z.string(),
    hsm: z.boolean(),
    createdAt: IsoDatetimeToDateCodecSchema,
    updatedAt: IsoDatetimeToDateCodecSchema,
  })
  .meta({
    id: 'WebAuthnCredentialKeyVaultKeyMeta',
    ref: 'WebAuthnCredentialKeyVaultKeyMeta',
  });

export type WebAuthnCredentialKeyVaultKeyMeta = z.infer<
  typeof WebAuthnCredentialKeyVaultKeyMetaSchema
>;
