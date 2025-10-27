import { factory } from '@/factory';
import { jwtMiddleware } from '@/middlewares/jwtMiddleware';
import { openapiMetadata } from '@/openapi-metadata';
import { serveStatic } from '@hono/node-server/serve-static';
import { HTTPException } from '@repo/exception';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';
import { resolver, describeRoute } from 'hono-openapi';
import z from 'zod';

import { auth } from './auth';
import { credentials } from './credentials';

export const root = factory
  .createApp()
  .basePath('/api')
  .onError((error) => {
    if (error instanceof HTTPException) {
      return error.toResponse();
    }

    throw error;
  })
  .use('/static/*', serveStatic({ root: './' }))
  .get(
    '/',
    describeRoute({
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: resolver(z.object({ ok: z.literal(true) })),
            },
          },
        },
      },
    }),
    jwtMiddleware,
    async (ctx) => {
      return ctx.json({
        ok: true,
        user: ctx.var.user,
      });
    },
  )
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
