import z from 'zod';

import { AuthenticationStateSchema } from './AuthenticationStateSchema';
import { RegistrationStateSchema } from './RegistrationStateSchema';
import { StateActionSchema } from './StateActionSchema';

export const StateTokenPayloadSchema = z.object({
  action: StateActionSchema,
  prevOptionsHash: z.string(),
  prevState: RegistrationStateSchema.or(AuthenticationStateSchema),
});

export type StateTokenPayload = z.infer<typeof StateTokenPayloadSchema>;
