import z from 'zod';

import { StateType } from './StateType';

export const RegistrationStateSchema = z.object({
  type: z.literal(StateType.REGISTRATION),
  up: z.boolean().optional(),
  uv: z.boolean().optional(),
});

export type RegistrationState = z.infer<typeof RegistrationStateSchema>;

export const RegistrationStateWithTokenSchema = RegistrationStateSchema.extend({
  current: z.string(),
});

export type RegistrationStateWithToken = z.infer<
  typeof RegistrationStateWithTokenSchema
>;
