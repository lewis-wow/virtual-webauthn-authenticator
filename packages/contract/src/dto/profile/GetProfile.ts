import z from 'zod';

import { JwtPayloadDtoSchema } from '../../zod-validation/auth/JwtPayloadDtoSchema';

// =============================================================================
// OPERATION: GET
// =============================================================================

// -------------------------------------
// Outputs
// -------------------------------------

export const GetProfileResponseSchema = z.object({
  jwtPayload: JwtPayloadDtoSchema.nullable(),
});
