import { env } from '@/env';
import { KeyClient } from '@azure/keyvault-keys';

import { azureCredential } from './azureCredential';

export const keyClient = new KeyClient(
  env.AZURE_KEY_VAULT_BASE_URL,
  azureCredential,
  {
    disableChallengeResourceVerification: true,
  },
);
