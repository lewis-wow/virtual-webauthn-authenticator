import { HttpStatusCode } from '@repo/http';
import z from 'zod';

// =============================================================================
// OPERATION: GET
// =============================================================================

// -------------------------------------
// Outputs
// -------------------------------------

export const GetHealthcheckResponseSchema = {
  [HttpStatusCode.OK]: z.object({
    healthy: z.literal(true),
  }),
};
