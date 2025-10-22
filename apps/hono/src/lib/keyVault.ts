import { KeyVault } from '@repo/key-vault';

import { cryptographyClientFactory } from './cryptographyClientFactory';
import { keyClient } from './keyClient';

export const keyVault = new KeyVault({
  keyClient,
  cryptographyClientFactory,
});
