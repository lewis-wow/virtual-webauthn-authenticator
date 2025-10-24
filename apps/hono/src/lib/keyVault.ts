import { KeyVault } from '@repo/key-vault';

import { cryptographyClientFactory } from './cryptographyClientFactory';
import { keyClient } from './keyClient';
import { Lazy } from './utils/lazy';

export const keyVault = new Lazy(
  'keyVault',
  async () =>
    new KeyVault({
      keyClient: await keyClient.resolve(),
      cryptographyClientFactory: await cryptographyClientFactory.resolve(),
    }),
);
