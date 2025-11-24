import { initContract } from '@ts-rest/core';

import { apiKeysRouter } from './apiKeys';

const c = initContract();

export const authServerContract = c.router(
  {
    apiKeys: apiKeysRouter,
  },
  {
    pathPrefix: '/api/auth',
  },
);
