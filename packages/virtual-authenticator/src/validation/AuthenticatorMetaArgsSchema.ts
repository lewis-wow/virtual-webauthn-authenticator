import z from 'zod';

export const AuthenticatorMetaArgsSchema = z.object({
  userId: z.string(),

  upEnabled: z.boolean(),
  uvEnabled: z.boolean(),
});

export type AuthenticatorMetaArgs = z.infer<typeof AuthenticatorMetaArgsSchema>;
