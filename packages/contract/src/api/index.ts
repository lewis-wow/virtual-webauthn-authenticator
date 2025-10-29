import { HTTPExceptionSchema } from '@repo/validation';
import { initContract } from '@ts-rest/core';

import { healthcheckRouter } from './healthcheck';

const c = initContract();

export const apiRouter = c.router(
  {
    healthcheck: healthcheckRouter,
  },
  {
    pathPrefix: '/api',
    commonResponses: {
      400: HTTPExceptionSchema,
      401: HTTPExceptionSchema,
      403: HTTPExceptionSchema,
      404: HTTPExceptionSchema,
      500: HTTPExceptionSchema,
    },
  },
);
