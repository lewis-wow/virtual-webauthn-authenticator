import z from 'zod';

export const WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema = z.object({
  id: z.uuid(),
  keyVaultKeyId: z.string().nullable(),
  keyVaultKeyName: z.string(),
  hsm: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WebAuthnPublicKeyCredentialKeyVaultKeyMeta = z.infer<
  typeof WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema
>;
