import z from 'zod';

import { EnvelopeResponseControlSchema } from './EnvelopeResponseControlSchema';
import { EnvelopeStatusSchema } from './enums/EnvelopeStatusSchema';

/**
 * Proprietary envelop schema.
 */
export const EnvelopeResponseSchema = z.object({
  status: EnvelopeStatusSchema,
  control: EnvelopeResponseControlSchema,

  /**
   * Spec standard payload.
   */
  payload: z.null().optional(),
});
