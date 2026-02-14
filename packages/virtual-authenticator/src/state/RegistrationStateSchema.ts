import z from 'zod';

import { UserPresenceStateSchema } from './states/UserPresenceStateSchema';
import { UserVerificationStateSchema } from './states/UserVerificationStateSchema';

export const RegistrationStateSchema = z
  .object({
    ...UserPresenceStateSchema.shape,
    ...UserVerificationStateSchema.shape,
  })
  .partial();

export type RegistrationState = z.infer<typeof RegistrationStateSchema>;
