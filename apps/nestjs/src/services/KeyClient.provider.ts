import { DefaultAzureCredential } from '@azure/identity';
import { KeyClient, KeyClientOptions } from '@azure/keyvault-keys';
import { Provider } from '@nestjs/common';

import { Env, ENV_PROVIDER_TOKEN } from './Env.provider';

export const KeyClientProvider: Provider = {
  provide: KeyClient,
  useFactory: (env: Env) => {
    const credential = new DefaultAzureCredential();

    const options: KeyClientOptions = {
      disableChallengeResourceVerification: env.ENVIRONMENT === 'development',
    };

    return new KeyClient(env.AZURE_KEY_VAULT_BASE_URL, credential, options);
  },
  inject: [ENV_PROVIDER_TOKEN],
};
