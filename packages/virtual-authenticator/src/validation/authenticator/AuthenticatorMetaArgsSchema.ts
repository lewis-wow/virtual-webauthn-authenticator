import z from 'zod';

export const AuthenticatorMetaArgsSchema = z.object({
  userId: z.string(),

  userVerificationEnabled: z.boolean(),
  userPresenceEnabled: z.boolean(),
});

export type AuthenticatorMetaArgs = z.infer<typeof AuthenticatorMetaArgsSchema>;
