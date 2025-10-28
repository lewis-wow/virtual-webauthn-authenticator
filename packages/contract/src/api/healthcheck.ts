import { IsoDatetimeToDateSchema } from '@repo/validation';
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const healthcheckRouter = c.router({
  get: {
    method: 'GET',
    path: '/api/healthcheck/get',
    responses: {
      200: z.object({
        healthy: z.literal(true),
        codec: IsoDatetimeToDateSchema,
      }),
    },
  },
});
