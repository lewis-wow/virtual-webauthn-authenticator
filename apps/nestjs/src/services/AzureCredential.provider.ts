import { DefaultAzureCredential } from '@azure/identity';
import { Provider } from '@nestjs/common';

export class AzureCredential extends DefaultAzureCredential {}

export const AzureCredentialProvider: Provider = {
  provide: AzureCredential,
  useFactory: () => {
    return new AzureCredential();
  },
};
