import { contract } from '@repo/contract';
import { initClient } from '@ts-rest/core';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';

export const tsr = initTsrReactQuery(contract, {
  baseUrl: '/',
});

export const apiClient = initClient(contract, {
  baseUrl: '/',
});
