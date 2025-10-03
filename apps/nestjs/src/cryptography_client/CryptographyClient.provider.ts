import { CryptographyClient, KeyVaultKey } from '@azure/keyvault-keys';
import { Provider } from '@nestjs/common';
import { DefaultAzureCredential } from '@azure/identity';

export const CryptographyClientProvider: Provider = {
  provide: CryptographyClient,
  useFactory: (
    key: string | KeyVaultKey,
    credentials: DefaultAzureCredential,
  ) => {
    return new CryptographyClient(key, credentials);
  },
  inject: [DefaultAzureCredential],
};
