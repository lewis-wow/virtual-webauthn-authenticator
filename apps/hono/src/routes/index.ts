import { env } from '@/env';
import { factory } from '@/factory';
import { auth } from '@/lib/auth';
import { serveStatic } from '@hono/node-server/serve-static';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';
import { cors } from 'hono/cors';

import { credentials } from './credentials';

export const root = factory
  .createApp()
  .use(
    cors({
      origin: [env.BASE_URL, 'http://localhost:3002'],
      maxAge: 600,
      credentials: true,
    }),
  )
  .use('/static/*', serveStatic({ root: './' }))
  .get('/', async (ctx) => {
    return ctx.text('OK');
  })
  .on(['POST', 'GET'], '/auth/*', (ctx) => {
    return auth.handler(ctx.req.raw);
  })
  .route('/credentials', credentials);

root
  .get(
    '/openapi.json',
    openAPIRouteHandler(root, {
      documentation: {
        openapi: '3.1.0',
        info: {
          title: 'API',
          version: '1.0.0',
          description: 'API',
        },
      },
    }),
  )
  .get(
    '/openapi',
    Scalar({
      pageTitle: 'API Documentation',
      theme: 'saturn',
      sources: [
        { url: '/openapi.json', title: 'API' },
        { url: '/auth/open-api/generate-schema', title: 'Auth' },
      ],
    }),
  );

export type Root = typeof root;
