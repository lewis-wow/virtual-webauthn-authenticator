import { initContract } from '@ts-rest/core';
import { z } from 'zod';

import { JwtPayloadDtoSchema } from '../validation/auth/JwtPayloadDtoSchema';

const c = initContract();

export const healthcheckRouter = c.router({
  get: {
    method: 'GET',
    path: '/healthcheck',
    responses: {
      200: z.object({
        healthy: z.literal(true),
        jwtPayload: JwtPayloadDtoSchema.nullable(),
      }),
    },
  },
});
