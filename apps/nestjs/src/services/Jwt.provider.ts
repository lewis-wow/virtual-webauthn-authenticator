import { Provider } from '@nestjs/common';
import { Jwt } from '@repo/auth';

import { Env, ENV_PROVIDER_TOKEN } from './Env.provider';

export const JwtProvider: Provider = {
  provide: Jwt,
  useFactory: (env: Env) => {
    const jwt = new Jwt({
      authServerBaseURL: env.AUTH_SERVER_BASE_URL,
    });

    return jwt;
  },
  inject: [ENV_PROVIDER_TOKEN],
};
