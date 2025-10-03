import { Provider } from '@nestjs/common';
import { env } from './env.js';

export const EnvProviderToken = 'Env';

export const EnvProvider: Provider = {
  provide: EnvProviderToken,
  useFactory: () => env,
};

export type Env = typeof env;
