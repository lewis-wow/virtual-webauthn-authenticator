import { CryptographyClientOptions } from '@azure/keyvault-keys';
import { Provider } from '@nestjs/common';
import { CryptographyClientFactory } from '@repo/key-vault';

import { AzureCredential } from './AzureCredential.provider';
import { Env, ENV_PROVIDER_TOKEN } from './Env.provider';

export const CryptographyClientFactoryProvider: Provider = {
  provide: CryptographyClientFactory,
  useFactory: (env: Env, azureCredential: AzureCredential) => {
    const cryptographyClientOptions: CryptographyClientOptions = {
      disableChallengeResourceVerification: ['development', 'test'].includes(
        env.ENVIRONMENT,
      ),
    };

    const cryptographyClientFactory = new CryptographyClientFactory({
      azureCredential,
      cryptographyClientOptions,
    });

    return cryptographyClientFactory;
  },
  inject: [ENV_PROVIDER_TOKEN, AzureCredential],
};
