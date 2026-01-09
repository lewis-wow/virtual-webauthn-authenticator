import z from 'zod';

import { EnvelopeStatusSchema } from './enums/EnvelopeStatusSchema';

/**
 * Proprietary envelop schema.
 */
export const EnvelopeResponseSchema = z.object({
  status: EnvelopeStatusSchema,

  /**
   * Internal state.
   */
  state: z.null().optional(),

  /**
   * Spec standard payload.
   */
  payload: z.null().optional(),
});
