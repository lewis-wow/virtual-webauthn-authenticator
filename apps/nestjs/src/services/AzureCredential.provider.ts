import { Provider } from '@nestjs/common';
import { DefaultAzureCredential } from '@azure/identity';

export const DefaultAzureCredentialProvider: Provider = {
  provide: DefaultAzureCredential,
  useFactory: () => {
    return new DefaultAzureCredential();
  },
};
