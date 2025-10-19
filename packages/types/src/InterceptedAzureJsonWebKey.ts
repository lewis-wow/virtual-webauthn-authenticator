import type { JsonWebKey } from '@azure/keyvault-keys';

export type InterceptedAzureJsonWebKey = JsonWebKey & {
  alg: string;
};
