import { AuthType } from '@repo/auth/enums';
import { contract } from '@repo/contract';
import { initClient } from '@ts-rest/core';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';

import { getBaseUrl } from './getBaseUrl';

export const tsr = initTsrReactQuery(contract, {
  baseUrl: getBaseUrl(),
  baseHeaders: {
    'X-Auth-Type': AuthType.SESSION,
  },
  validateResponse: true,
});

export const $api = initClient(contract, {
  baseUrl: getBaseUrl(),
  baseHeaders: {
    'X-Auth-Type': AuthType.SESSION,
  },
  credentials: 'same-origin',
});

$api.api.profile.get({});
