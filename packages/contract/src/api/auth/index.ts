import { initContract } from '@ts-rest/core';

import { apiKeysRouter } from './apiKeys';

const c = initContract();

export const authRouter = c.router(
  {
    apiKeys: apiKeysRouter,
  },
  {
    pathPrefix: '/auth',
  },
);
