import { KeyClient } from '@azure/keyvault-keys';
import { Provider } from '@nestjs/common';
import { CryptographyClientFactory, KeyVault } from '@repo/key-vault';

export const KeyVaultProvider: Provider = {
  provide: KeyVault,
  useFactory: (
    keyClient: KeyClient,
    cryptographyClientFactory: CryptographyClientFactory,
  ) => {
    const keyVault = new KeyVault({
      keyClient,
      cryptographyClientFactory,
    });

    return keyVault;
  },
  inject: [KeyClient, CryptographyClientFactory],
};
