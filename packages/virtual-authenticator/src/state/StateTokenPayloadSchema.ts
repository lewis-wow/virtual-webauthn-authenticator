import z from 'zod';

import { AuthenticationPrevStateSchema } from './AuthenticationPrevStateSchema';
import { RegistrationPrevStateSchema } from './RegistrationPrevStateSchema';
import { StateActionSchema } from './StateActionSchema';

export const StateTokenPayloadSchema = z.object({
  action: StateActionSchema,
  prevOptionsHash: z.string(),
  prevState: RegistrationPrevStateSchema.or(AuthenticationPrevStateSchema),
});

export type StateTokenPayload = z.infer<typeof StateTokenPayloadSchema>;
