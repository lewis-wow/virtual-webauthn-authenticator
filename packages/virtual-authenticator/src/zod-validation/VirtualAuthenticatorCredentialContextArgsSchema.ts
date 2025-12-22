import z from 'zod';

export const VirtualAuthenticatorCredentialContextArgsSchema = z.object({
  apiKeyId: z.string().nullable(),
});

export type VirtualAuthenticatorCredentialContextArgs = z.infer<
  typeof VirtualAuthenticatorCredentialContextArgsSchema
>;
