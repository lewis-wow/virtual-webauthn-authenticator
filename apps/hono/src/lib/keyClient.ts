import { env } from '@/env';
import { KeyClient } from '@azure/keyvault-keys';

import { azureCredential } from './azureCredential';
import { Lazy } from './utils/Lazy';

export const keyClient = new Lazy(
  'keyClient',
  async () =>
    new KeyClient(
      env.AZURE_KEY_VAULT_BASE_URL,
      await azureCredential.resolve(),
      {
        disableChallengeResourceVerification: true,
      },
    ),
);
