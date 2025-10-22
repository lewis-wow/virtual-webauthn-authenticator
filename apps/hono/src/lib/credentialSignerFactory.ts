import { CredentialSignerFactory } from '@repo/key-vault';

import { keyVault } from './keyVault';

export const credentialSignerFactory = new CredentialSignerFactory({
  keyVault,
});
