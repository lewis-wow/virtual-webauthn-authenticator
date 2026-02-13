import z from 'zod';

import { RegistrationStateSchema } from './RegistrationStateSchema';

export const RegistrationStateTokenPayloadSchema =
  RegistrationStateSchema.extend({
    optionsHash: z.string(),
  });

export type RegistrationStateTokenPayload = z.infer<
  typeof RegistrationStateTokenPayloadSchema
>;
