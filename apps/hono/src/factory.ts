import { auth } from '@/lib/auth';
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
    user: typeof auth.$InferLazyModule.$Infer.Session.user | null;
    session: typeof auth.$InferLazyModule.$Infer.Session.session | null;
  };
};

export type inferEnv<T> = T extends Hono<infer iEnv> ? iEnv : never;

const initApp = (app: Hono) => {
  return app
    .use(auth.middleware())
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

// .use(async (ctx, next) => {
//   const session = await ctx.var.auth.api.getSession({
//     headers: ctx.req.raw.headers,
//   });

//   if (!session) {
//     ctx.set('user', null);
//     ctx.set('session', null);
//     return next();
//   }

//   ctx.set('user', session.user);
//   ctx.set('session', session.session);
//   return next();
// });
