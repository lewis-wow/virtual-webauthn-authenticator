import z from 'zod';

import { RegistrationStateSchema } from './RegistrationStateSchema';

export const RegistrationPrevStateSchema = RegistrationStateSchema.extend({
  optionsHash: z.string(),
});

export type RegistrationPrevState = z.infer<typeof RegistrationPrevStateSchema>;
