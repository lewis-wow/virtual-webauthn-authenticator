import { contract } from '@repo/contract';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';

export const tsr = initTsrReactQuery(contract, {
  baseUrl: '/',
});
