import z from 'zod';

import { RegistrationStateSchema } from '../../authenticator/state/RegistrationStateSchema';

export const RegistrationStateAgentSchema = RegistrationStateSchema.extend({
  optionsHash: z.string(),
});

export type RegistrationStateAgent = z.infer<
  typeof RegistrationStateAgentSchema
>;

export const RegistrationStateWithTokenAgentSchema =
  RegistrationStateAgentSchema.extend({
    current: z.string(),
  });

export type RegistrationStateWithTokenAgent = z.infer<
  typeof RegistrationStateWithTokenAgentSchema
>;
