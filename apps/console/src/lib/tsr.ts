import { contract } from '@repo/contract';
import { AuthType } from '@repo/enums';
import { initClient } from '@ts-rest/core';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';

export const tsr = initTsrReactQuery(contract, {
  baseUrl: '/',
  baseHeaders: {
    'X-Auth-Type': AuthType.SESSION,
  },
  validateResponse: true,
});

export const $api = initClient(contract, {
  baseUrl: '/',
  baseHeaders: {
    'X-Auth-Type': AuthType.SESSION,
  },
});
