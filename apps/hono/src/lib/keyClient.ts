import { env } from '@/env';
import { KeyClient } from '@azure/keyvault-keys';

import { azureCredential } from './azureCredential';

export const keyClient = new KeyClient(env.KEY_VAULT_URL, azureCredential);
