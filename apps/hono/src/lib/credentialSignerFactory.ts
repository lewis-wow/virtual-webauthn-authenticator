import { CredentialSignerFactory } from '@repo/key-vault';

import { keyVault } from './keyVault';
import { Lazy } from './utils/Lazy';

export const credentialSignerFactory = new Lazy(
  'credentialSignerFactory',
  async () =>
    new CredentialSignerFactory({
      keyVault: await keyVault.resolve(),
    }),
);
