import z from 'zod';

export const AuthenticatorContextArgsSchema = z
  .object({
    selectedCredentialOptionId: z.string().optional(),
    hash: z.string().optional(),
  })
  .optional();

export type AuthenticatorContextArgs = z.infer<
  typeof AuthenticatorContextArgsSchema
>;
