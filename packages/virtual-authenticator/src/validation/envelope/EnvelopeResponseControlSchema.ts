import z from 'zod';

import { EnvelopeRequestControlSchema } from './EnvelopeRequestControlSchema';

export const EnvelopeResponseControlSchema =
  EnvelopeRequestControlSchema.extend({
    /**
     * Optional reason message.
     */
    reason: z.string().optional(),
  });
