import { JwtPayloadSchema } from '@repo/auth/zod-validation';
import { HttpStatusCode } from '@repo/http';
import z from 'zod';

// =============================================================================
// OPERATION: GET
// =============================================================================

// -------------------------------------
// Outputs
// -------------------------------------

export const GetProfileResponseSchema = {
  [HttpStatusCode.OK]: z.object({
    jwtPayload: JwtPayloadSchema.nullable(),
  }),
};
