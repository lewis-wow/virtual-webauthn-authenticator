import { DefaultAzureCredential } from '@azure/identity';

import { Lazy } from './utils/Lazy';

export const azureCredential = new Lazy(
  'azureCredential',
  () => new DefaultAzureCredential(),
);
