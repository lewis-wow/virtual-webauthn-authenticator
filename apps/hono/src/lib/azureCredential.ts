import { DefaultAzureCredential } from '@azure/identity';

import { Lazy } from './utils/lazy';

export const azureCredential = new Lazy(
  'azureCredential',
  () => new DefaultAzureCredential(),
);
