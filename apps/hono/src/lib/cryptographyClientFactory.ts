import { CryptographyClientFactory } from '@repo/key-vault';

import { azureCredential } from './azureCredential';
import { Lazy } from './utils/Lazy';

export const cryptographyClientFactory = new Lazy(
  'cryptographyClientFactory',
  async () =>
    new CryptographyClientFactory({
      azureCredential: await azureCredential.resolve(),
    }),
);
