import { Provider } from '@nestjs/common';
import { JwtAudience } from '@repo/auth';

import { Env, ENV_PROVIDER_TOKEN } from './Env.provider';

export const JwtAudienceProvider: Provider = {
  provide: JwtAudience,
  useFactory: (env: Env) => {
    const jwtAudience = new JwtAudience({
      authServerBaseURL: env.AUTH_SERVER_BASE_URL,
      config: {
        aud: env.AUTH_SERVER_BASE_URL,
        iss: env.AUTH_SERVER_BASE_URL,
      },
    });

    return jwtAudience;
  },
  inject: [ENV_PROVIDER_TOKEN],
};
