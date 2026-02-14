import z from 'zod';

import { RegistrationStateSchema } from './RegistrationStateSchema';
import { StateActionSchema } from './StateActionSchema';

export const RegistrationPrevStateSchema = RegistrationStateSchema.extend({});
export type RegistrationPrevState = z.infer<typeof RegistrationPrevStateSchema>;

export const RegistrationPrevStateWithActionSchema =
  RegistrationPrevStateSchema.extend({
    action: StateActionSchema,
  });
export type RegistrationPrevStateWithAction = z.infer<
  typeof RegistrationPrevStateWithActionSchema
>;
