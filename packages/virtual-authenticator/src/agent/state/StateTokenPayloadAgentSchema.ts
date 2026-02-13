import z from 'zod';

import { StateActionSchema } from '../../authenticator/state/StateActionSchema';
import { AuthenticationStateAgentSchema } from './AuthenticationStateAgentSchema';
import { RegistrationStateAgentSchema } from './RegistrationStateAgentSchema';

export const StateTokenPayloadAgentSchema = z.object({
  action: StateActionSchema,
  optionsHash: z.string(),
  current: z
    .discriminatedUnion('type', [
      RegistrationStateAgentSchema,
      AuthenticationStateAgentSchema,
    ])
    .optional(),
});

export type StateTokenPayloadAgent = z.infer<
  typeof StateTokenPayloadAgentSchema
>;
