import { JwtPayloadSchema } from '@repo/auth/zod-validation';
import z from 'zod';

// =============================================================================
// OPERATION: GET
// =============================================================================

// -------------------------------------
// Outputs
// -------------------------------------

export const GetProfileResponseSchema = z.object({
  jwtPayload: JwtPayloadSchema.nullable(),
});
