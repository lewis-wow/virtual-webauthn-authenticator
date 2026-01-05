import z from 'zod';

export const AuthenticatorMetaArgsSchema = z.object({
  userId: z.string(),
});

export type AuthenticatorMetaArgs = z.infer<typeof AuthenticatorMetaArgsSchema>;
