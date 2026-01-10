import z from 'zod';

export const AuthenticatorContextArgsSchema = z
  .object({
    selectedCredentailOptionId: z.string().optional(),
    hash: z.string(),
  })
  .optional();

export type AuthenticatorContextArgs = z.infer<
  typeof AuthenticatorContextArgsSchema
>;
