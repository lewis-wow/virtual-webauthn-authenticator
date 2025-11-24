import { initContract } from '@ts-rest/core';

import { GetHealthcheckResponseSchema } from '../zod-validation/healthcheck/get/GetHealthcheckResponseSchema';

const c = initContract();

export const healthcheckRouter = c.router({
  get: {
    method: 'GET',
    path: '/healthcheck',
    responses: {
      200: GetHealthcheckResponseSchema,
    },
    summary: 'Check the health of the service',
  },
});
