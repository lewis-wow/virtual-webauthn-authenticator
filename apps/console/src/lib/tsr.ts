import { AuthType } from '@repo/auth/enums';
import { authServerContract } from '@repo/contract/auth-server';
import { nestjsContract } from '@repo/contract/nestjs';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';

import { getBaseUrl } from './getBaseUrl';

export const $api = initTsrReactQuery(nestjsContract, {
  baseUrl: getBaseUrl(),
  baseHeaders: {
    'X-Auth-Type': AuthType.SESSION,
  },
  validateResponse: true,
});

export const $authServer = initTsrReactQuery(authServerContract, {
  baseUrl: getBaseUrl(),
  baseHeaders: {
    'X-Auth-Type': AuthType.SESSION,
  },
  validateResponse: true,
});
