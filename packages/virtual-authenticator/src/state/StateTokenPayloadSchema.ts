import z from 'zod';

import { StateActionSchema } from './StateActionSchema';

export const StateTokenPayloadSchema = z.object({
  action: StateActionSchema,
  prevOptionsHash: z.string(),
});

export type StateTokenPayload = z.infer<typeof StateTokenPayloadSchema>;
