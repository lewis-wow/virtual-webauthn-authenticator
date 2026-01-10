import z from 'zod';

import { BytesSchema } from '../BytesSchema';
import { AuthenticatorContextArgsSchema } from '../authenticator/AuthenticatorContextArgsSchema';

export const AuthenticatorAgentContextArgsSchema = z
  .object({
    authenticatorContext: AuthenticatorContextArgsSchema,
    hash: BytesSchema,
  })
  .optional();

export type AuthenticatorAgentContextArgs = z.infer<
  typeof AuthenticatorAgentContextArgsSchema
>;
