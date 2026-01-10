import z from 'zod';

import { AuthenticatorContextArgsSchema } from '../authenticator/AuthenticatorContextArgsSchema';

export const AuthenticatorAgentContextArgsSchema = z
  .object({
    authenticatorContext: AuthenticatorContextArgsSchema,
    hash: z.string(),
  })
  .optional();

export type AuthenticatorAgentContextArgs = z.infer<
  typeof AuthenticatorAgentContextArgsSchema
>;
