import { factory } from '@/factory';
import { serveStatic } from '@hono/node-server/serve-static';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';

import { credentials } from './credentials';

export const root = factory
  .createApp()
  .use('/static/*', serveStatic({ root: './' }))
  .get('/', async (ctx) => {
    return ctx.text('OK');
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
      theme: 'saturn',
      url: '/openapi.json',
    }),
  );

export type Root = typeof root;
