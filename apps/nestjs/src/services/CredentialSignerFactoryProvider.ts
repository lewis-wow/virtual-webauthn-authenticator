import { Provider } from '@nestjs/common';
import { CredentialSignerFactory, KeyVault } from '@repo/key-vault';

export const CredentialSignerFactoryProvider: Provider = {
  provide: CredentialSignerFactory,
  useFactory: (keyVault: KeyVault) => {
    const credentialSignerFactory = new CredentialSignerFactory({ keyVault });

    return credentialSignerFactory;
  },
  inject: [KeyVault],
};
