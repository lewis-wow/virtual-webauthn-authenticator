import { Provider } from '@nestjs/common';
import { CryptographyClientFactory } from '@repo/key-vault';

import { AzureCredential } from './AzureCredential.provider';

export const CryptographyClientFactoryProvider: Provider = {
  provide: CryptographyClientFactory,
  useFactory: (azureCredential: AzureCredential) => {
    const cryptographyClientFactory = new CryptographyClientFactory({
      azureCredential,
    });

    return cryptographyClientFactory;
  },
  inject: [AzureCredential],
};
