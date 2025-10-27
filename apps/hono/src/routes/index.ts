import { factory } from '@/factory';
import { sessionMiddleware } from '@/middlewares/sessionMiddleware';
import { openapiMetadata } from '@/openapi-metadata';
import { serveStatic } from '@hono/node-server/serve-static';
import { HTTPException } from '@repo/exception';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';
import { cors } from 'hono/cors';

import { auth } from './auth';
import { credentials } from './credentials';

export const root = factory
  .createApp()

  .onError((error) => {
    if (error instanceof HTTPException) {
      return error.toResponse();
    }

    throw error;
  })
  .use(
    cors({
      credentials: true,
      origin: ['http://localhost:3000'],
    }),
  )
  .use('/static/*', serveStatic({ root: './' }))
  .get('/', async (ctx) => {
    return ctx.text('OK');
  })
  .use('*', sessionMiddleware)
  .route('credentials', credentials)
  .route('auth', auth);

root.get('.well-known/jwks.json', async (ctx) => {
  const jwks = await ctx.var.jwt.getJwks();

  return ctx.json(jwks);
});

root.get('/openapi.json', openAPIRouteHandler(root, openapiMetadata as object));

root.get(
  '/openapi',
  Scalar({
    pageTitle: 'API Documentation',
    theme: 'saturn',
    sources: [{ url: '/openapi.json', title: 'API' }],
  }),
);

export type Root = typeof root;
