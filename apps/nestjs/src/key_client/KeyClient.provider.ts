import { KeyClient, KeyClientOptions } from '@azure/keyvault-keys';
import { Provider } from '@nestjs/common';
import { EnvProviderToken, Env } from '../env/Env.provider.js';
import { DefaultAzureCredential } from '@azure/identity';

export const KeyClientProvider: Provider = {
  provide: KeyClient,
  useFactory: (env: Env) => {
    const credential = new DefaultAzureCredential();

    const options: KeyClientOptions = {
      disableChallengeResourceVerification: env.ENVIRONMENT === 'development',
    };

    return new KeyClient(env.AZURE_KEY_VAULT_HOST, credential, options);
  },
  inject: [EnvProviderToken],
};
