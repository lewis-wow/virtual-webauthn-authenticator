import { initContract } from '@ts-rest/core';

import { apiRouter } from './api';

const c = initContract();

export const contract = c.router({
  api: apiRouter,
});
