import { KeyVault } from '@repo/key-vault';

import { credentialsDiscovery } from './credentailsDiscovery';
import { cryptographyClientFactory } from './cryptographyClientFactory';
import { keyClient } from './keyClient';

export const keyVault = new KeyVault({
  keyClient,
  credentialsDiscovery,
  cryptographyClientFactory,
});
