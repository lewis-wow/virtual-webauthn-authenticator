import { CredentialSignerFactory } from '@repo/key-vault';

import { keyVault } from './keyVault';
import { Lazy } from './utils/lazy';

export const credentialSignerFactory = new Lazy(
  'credentialSignerFactory',
  async () =>
    new CredentialSignerFactory({
      keyVault: await keyVault.resolve(),
    }),
);
