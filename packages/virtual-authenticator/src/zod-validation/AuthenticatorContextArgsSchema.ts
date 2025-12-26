import z from 'zod';

export const AuthenticatorContextArgsSchema = z.object({
  apiKeyId: z.string().nullable(),
});

export type AuthenticatorContextArgs = z.infer<
  typeof AuthenticatorContextArgsSchema
>;
