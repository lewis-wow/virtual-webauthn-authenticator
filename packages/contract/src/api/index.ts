import { initContract } from '@ts-rest/core';

import { healthcheckRouter } from './healthcheck';

const c = initContract();

export const apiRouter = c.router({
  healthcheck: healthcheckRouter,
});
