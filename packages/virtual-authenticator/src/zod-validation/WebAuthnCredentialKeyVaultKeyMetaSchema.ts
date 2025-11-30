import z from 'zod';

export const WebAuthnCredentialKeyVaultKeyMetaSchema = z.object({
  id: z.uuid(),
  keyVaultKeyId: z.string().nullable(),
  keyVaultKeyName: z.string(),
  hsm: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WebAuthnCredentialKeyVaultKeyMeta = z.infer<
  typeof WebAuthnCredentialKeyVaultKeyMetaSchema
>;
