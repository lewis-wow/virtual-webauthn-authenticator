import { initContract } from '@ts-rest/core';
import { Schema } from 'effect';

import { GetHealthcheckResponseSchema } from '../validation/healthcheck/get/GetHealthcheckResponseSchema';

const c = initContract();

export const healthcheckRouter = c.router({
  get: {
    method: 'GET',
    path: '/healthcheck',
    responses: {
      200: Schema.standardSchemaV1(GetHealthcheckResponseSchema),
    },
  },
});
