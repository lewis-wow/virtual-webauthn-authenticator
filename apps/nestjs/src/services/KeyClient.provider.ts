import { KeyClient, KeyClientOptions } from '@azure/keyvault-keys';
import { Provider } from '@nestjs/common';

import { AzureCredential } from './AzureCredential.provider';
import { Env, ENV_PROVIDER_TOKEN } from './Env.provider';

export const KeyClientProvider: Provider = {
  provide: KeyClient,
  useFactory: (env: Env, azureCredential: AzureCredential) => {
    const keyClientOptions: KeyClientOptions = {
      disableChallengeResourceVerification: ['development', 'test'].includes(
        env.ENVIRONMENT,
      ),
    };

    return new KeyClient(
      env.AZURE_KEY_VAULT_BASE_URL,
      azureCredential,
      keyClientOptions,
    );
  },
  inject: [ENV_PROVIDER_TOKEN, AzureCredential],
};
