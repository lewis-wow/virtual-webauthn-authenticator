import z from 'zod';

import { EnvelopeRequestControlSchema } from './EnvelopeRequestControlSchema';

/**
 * Proprietary envelop schema.
 */
export const EnvelopeRequestSchema = z.object({
  /**
   * Spec standard payload.
   */
  payload: z.null().optional(),

  control: EnvelopeRequestControlSchema.optional(),
});

export type EnvelopeRequest = z.infer<typeof EnvelopeRequestSchema>;
