import { Provider } from '@nestjs/common';
import { Jwks } from '@repo/crypto';
import { PrismaVirtualAuthenticatorJwksRepository } from '@repo/virtual-authenticator/repositories';

import { Env, ENV_PROVIDER_TOKEN } from './Env.provider';

export const JwksProvider: Provider = {
  provide: Jwks,
  useFactory: (
    env: Env,
    jwksRepository: PrismaVirtualAuthenticatorJwksRepository,
  ) => {
    const jwks = new Jwks({
      encryptionKey: env.ENCRYPTION_KEY,
      jwksRepository,
    });

    return jwks;
  },
  inject: [ENV_PROVIDER_TOKEN, PrismaVirtualAuthenticatorJwksRepository],
};
