import { initContract } from '@ts-rest/core';

import { GetHealthcheckResponseSchema } from '../dto/healthcheck/GetHealthcheck';

const c = initContract();

export const healthcheckRouter = c.router({
  get: {
    method: 'GET',
    path: '/healthcheck',
    responses: GetHealthcheckResponseSchema,
    summary: 'Check the health of the service',
  },
});
