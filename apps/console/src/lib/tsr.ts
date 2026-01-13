import { AuthType } from '@repo/auth/enums';
import { authServerContract } from '@repo/contract/auth-server';
import { nestjsContract } from '@repo/contract/nestjs';
import { initContract } from '@ts-rest/core';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';

import { getBaseUrl } from './getBaseUrl';

const c = initContract();

const $apiContract = c.router({
  api: {
    ...nestjsContract.api,
    ...authServerContract.api,
  },
});

export const $api = initTsrReactQuery($apiContract, {
  baseUrl: getBaseUrl(),
  baseHeaders: {
    'X-Auth-Type': AuthType.SESSION,
  },
  validateResponse: true,
});
