import { KeyClient } from '@azure/keyvault-keys';
import { Provider } from '@nestjs/common';
import {
  AzureKeyVaultKeyProvider,
  CryptographyClientFactory,
} from '@repo/key-vault';

export const AzureKeyVaultKeyProviderProvider: Provider = {
  provide: AzureKeyVaultKeyProvider,
  useFactory: (
    keyClient: KeyClient,
    cryptographyClientFactory: CryptographyClientFactory,
  ) => {
    const azureKeyVaultKeyProvider = new AzureKeyVaultKeyProvider({
      keyClient,
      cryptographyClientFactory,
    });

    return azureKeyVaultKeyProvider;
  },
  inject: [KeyClient, CryptographyClientFactory],
};
