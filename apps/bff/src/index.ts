import { serve } from '@hono/node-server';
import { proxy } from '@repo/proxy';
import { cors } from 'hono/cors';

import { container } from './container';
import { env } from './env';
import { factory } from './factory';

const app = factory.createApp();

app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow requests from browser extensions
      if (
        origin.startsWith('chrome-extension://') ||
        origin.startsWith('moz-extension://')
      ) {
        return origin;
      }
    },
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Auth-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.use(async (ctx, next) => {
  const container = ctx.get('container');
  const logger = container.resolve('logger');

  logger.info('Proxy request', {
    url: ctx.req.url,
    method: ctx.req.method,
    headers: Object.fromEntries(ctx.req.raw.headers.entries()),
  });

  await next();

  logger.info('Proxy response', {
    url: ctx.req.url,
    method: ctx.req.method,
    status: ctx.res.status,
    headers: Object.fromEntries(ctx.res.headers.entries()),
  });
});

app.all('/api/auth/*', async (ctx) => {
  const response = await proxy('http://localhost:3002', ctx.req.raw);

  console.log(response);

  return response;
});

// app.all('/api/*', async (ctx) => {
//   const response = await proxy('http://localhost:3001', ctx.req.raw);

//   console.log(response);

//   return response;
// });

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    const log = container.resolve('logger');
    log.info(`Server is running on http://localhost:${info.port}`);
  },
);
