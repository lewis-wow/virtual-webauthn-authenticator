import { z } from 'zod';

import { JwtPayloadDtoSchema } from '../../auth/JwtPayloadDtoSchema';

export const GetProfileResponseSchema = z
  .object({
    jwtPayload: JwtPayloadDtoSchema.nullable(),
  })
  .meta({
    id: 'GetProfileResponse',
    description: "Response for a user's profile, including their JWT payload.",
  });
