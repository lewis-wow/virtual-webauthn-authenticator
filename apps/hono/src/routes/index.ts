import { factory } from '@/factory';
import { sessionMiddleware } from '@/middlewares/sessionMiddleware';
import { serveStatic } from '@hono/node-server/serve-static';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';

import { auth } from './auth';
import { credentials } from './credentials';

export const root = factory
  .createApp()
  .use(
    cors({
      origin: ['http://localhost:3000'],
      maxAge: 600,
      credentials: true,
    }),
  )
  .use('/static/*', serveStatic({ root: './' }))
  .get('/', async (ctx) => {
    return ctx.text('OK');
  })
  .use('api/*', sessionMiddleware)
  .route('api/credentials', credentials)
  .route('api/auth', auth);

root.get(
  '/openapi',
  Scalar({
    pageTitle: 'API Documentation',
    theme: 'saturn',
    sources: [{ url: '/openapi.json', title: 'API' }],
  }),
);

export type Root = typeof root;
