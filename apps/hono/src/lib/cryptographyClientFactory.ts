import { CryptographyClientFactory } from '@repo/key-vault';

import { azureCredential } from './azureCredential';
import { Lazy } from './utils/lazy';

export const cryptographyClientFactory = new Lazy(
  'cryptographyClientFactory',
  async () =>
    new CryptographyClientFactory({
      azureCredential: await azureCredential.resolve(),
    }),
);
