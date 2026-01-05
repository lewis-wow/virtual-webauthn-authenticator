import z from 'zod';

import { AuthenticatorContextArgsSchema } from './AuthenticatorContextArgsSchema';

export const AuthenticatorAgentContextArgsSchema =
  AuthenticatorContextArgsSchema;

export type AuthenticatorAgentContextArgs = z.infer<
  typeof AuthenticatorAgentContextArgsSchema
>;
