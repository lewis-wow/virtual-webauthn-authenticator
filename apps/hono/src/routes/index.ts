import { factory } from '@/factory';
import { serveStatic } from '@hono/node-server/serve-static';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';

import { credentials } from './credentials';

export const root = factory.createApp();
root.use('*', serveStatic({ root: './static' }));
root.get('/', async (ctx) => {
  return ctx.text('OK');
});

root.route('/credentials', credentials);

root.get(
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
);

root.get(
  '/openapi',
  Scalar({
    theme: 'saturn',
    url: '/openapi.json',
  }),
);
