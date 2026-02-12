import z from 'zod';

import { StateType } from './StateType';

export const RegistrationStateSchema = z.object({
  type: z.literal(StateType.REGISTRATION),
  optionsHash: z.string(),
  up: z.boolean().optional(),
  uv: z.boolean().optional(),
});

export type RegistrationState = z.infer<typeof RegistrationStateSchema>;
