import type { User } from '@repo/prisma';
import type { Hono } from 'hono';
import { createFactory } from 'hono/factory';

import { azureCredential } from './lib/azureCredential';
import { credentialSignerFactory } from './lib/credentialSignerFactory';
import { cryptographyClientFactory } from './lib/cryptographyClientFactory';
import { keyClient } from './lib/keyClient';
import { keyVault } from './lib/keyVault';
import { prisma } from './lib/prisma';
import { virtualAuthenticator } from './lib/virtualAuthenticator';
import { webAuthnCredentialRepository } from './lib/webAuthnCredentialRepository';

export type FactoryEnv = {
  Variables: {
    user: User | null;
  };
};

export type inferEnv<T> = T extends Hono<infer iEnv> ? iEnv : never;

const initApp = (app: Hono) => {
  return app
    .use(azureCredential.middleware())
    .use(credentialSignerFactory.middleware())
    .use(cryptographyClientFactory.middleware())
    .use(keyClient.middleware())
    .use(keyVault.middleware())
    .use(prisma.middleware())
    .use(virtualAuthenticator.middleware())
    .use(webAuthnCredentialRepository.middleware());
};

export const factory = createFactory<
  FactoryEnv & inferEnv<ReturnType<typeof initApp>>
>({
  initApp: (app) => initApp(app as any),
});
