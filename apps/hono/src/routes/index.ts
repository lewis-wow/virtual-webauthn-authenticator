import { factory } from '@/factory';
import { openapiMetadata } from '@/openapi-metadata';
import { serveStatic } from '@hono/node-server/serve-static';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';

import { api } from './api';

export const root = factory.createApp().route('/api', api);

root.use('/static/*', serveStatic({ root: './' }));

root.get('/openapi.json', openAPIRouteHandler(root, openapiMetadata as object));

root.get(
  '/openapi',
  Scalar({
    pageTitle: 'API Documentation',
    theme: 'saturn',
    sources: [{ url: '/openapi.json', title: 'API' }],
  }),
);
