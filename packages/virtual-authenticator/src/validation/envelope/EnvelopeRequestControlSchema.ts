import z from 'zod';

export const EnvelopeRequestControlSchema = z.object({
  /**
   * Signed JWT with state object.
   */
  stateToken: z.string().optional(),
});
