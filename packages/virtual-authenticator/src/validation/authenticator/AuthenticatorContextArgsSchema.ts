import z from 'zod';

export const AuthenticatorContextArgsSchema = z.object({
  selectedCredentailId: z.string().optional(),
  optionsHash: z.string().optional(),
});

export type AuthenticatorContextArgs = z.infer<
  typeof AuthenticatorContextArgsSchema
>;
