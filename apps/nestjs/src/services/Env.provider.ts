import { Provider } from '@nestjs/common';

import { env } from '../env';

export const ENV_PROVIDER_TOKEN = 'Env';

export const EnvProvider: Provider = {
  provide: ENV_PROVIDER_TOKEN,
  useFactory: () => env,
};

export type Env = typeof env;
