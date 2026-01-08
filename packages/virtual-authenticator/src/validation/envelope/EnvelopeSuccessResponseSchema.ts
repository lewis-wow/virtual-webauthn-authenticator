import z from 'zod';

import { EnvelopeResponseSchema } from './EnvelopeResponseSchema';

/**
 * Proprietary envelop schema.
 */
export const EnvelopeSuccessResponseSchema = EnvelopeResponseSchema.omit({
  control: true,
}).extend({
  /**
   * Spec standard payload.
   */
  payload: z.null(),
});

export type EnvelopeSuccessResponse = z.infer<
  typeof EnvelopeSuccessResponseSchema
>;
