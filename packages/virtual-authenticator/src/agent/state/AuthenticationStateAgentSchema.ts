import z from 'zod';

import { AuthenticationStateSchema } from '../../authenticator/state/AuthenticationStateSchema';

export const AuthenticationStateAgentSchema = AuthenticationStateSchema.extend({
  optionsHash: z.string(),
});

export type AuthenticationStateAgent = z.infer<
  typeof AuthenticationStateSchema
>;

export const AuthenticationStateWithTokenAgentSchema =
  AuthenticationStateAgentSchema.extend({
    current: z.string(),
  });

export type AuthenticationStateWithTokenAgent = z.infer<
  typeof AuthenticationStateWithTokenAgentSchema
>;
