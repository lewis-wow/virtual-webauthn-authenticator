import { initContract } from '@ts-rest/core';

import { apiKeysRouter } from './apiKeys';

const c = initContract();

export const authServerContract = c.router(
  {
    api: c.router({
      auth: c.router({
        apiKeys: apiKeysRouter,
      }),
    }),
  },
  {
    pathPrefix: '/api/auth',
  },
);
