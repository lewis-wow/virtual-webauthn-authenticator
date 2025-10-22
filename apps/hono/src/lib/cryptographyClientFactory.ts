import { CryptographyClientFactory } from '@repo/key-vault';

import { azureCredential } from './azureCredential';

export const cryptographyClientFactory = new CryptographyClientFactory({
  azureCredential,
});
