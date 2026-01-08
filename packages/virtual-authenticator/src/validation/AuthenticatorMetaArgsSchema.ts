import z from 'zod';

export const AuthenticatorMetaArgsSchema = z.object({
  userId: z.string(),

  userVerificationEnabled: z.boolean(),
  userPresenceEnabled: z.literal(true),
});

export type AuthenticatorMetaArgs = z.infer<typeof AuthenticatorMetaArgsSchema>;
