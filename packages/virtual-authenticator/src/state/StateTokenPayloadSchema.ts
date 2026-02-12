import z from 'zod';

import { AuthenticationStateSchema } from './AuthenticationStateSchema';
import { RegistrationStateSchema } from './RegistrationStateSchema';
import { StateActionSchema } from './StateActionSchema';

export const StateTokenPayloadSchema = z.object({
  action: StateActionSchema,
  optionsHash: z.string(),
  current: z
    .discriminatedUnion('type', [
      RegistrationStateSchema,
      AuthenticationStateSchema,
    ])
    .optional(),
});

export type StateTokenPayload = z.infer<typeof StateTokenPayloadSchema>;
