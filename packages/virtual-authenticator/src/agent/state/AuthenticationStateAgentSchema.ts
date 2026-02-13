import z from 'zod';

import { AuthenticationStateSchema } from '../../authenticator/state/AuthenticationStateSchema';

export const AuthenticationStateAgentSchema = AuthenticationStateSchema.extend({
  optionsHash: z.string(),
});

export type AuthenticationStateAgent = z.infer<
  typeof AuthenticationStateAgentSchema
>;

export const AuthenticationStateWithTokenAgentSchema =
  AuthenticationStateAgentSchema.extend({
    current: AuthenticationStateAgentSchema,
  });

export type AuthenticationStateWithTokenAgent = z.infer<
  typeof AuthenticationStateWithTokenAgentSchema
>;
