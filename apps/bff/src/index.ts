import { serve } from '@hono/node-server';
import { proxy } from '@repo/proxy';

import { container } from './container';
import { env } from './env';
import { factory } from './factory';

const app = factory.createApp();

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
    status: ctx.res.status,
    headers: Object.fromEntries(ctx.res.headers.entries()),
  });
});

app.all('/api/auth/*', async (ctx) => {
  const response = await proxy('http://localhost:3002', ctx.req.raw);

  console.log(response);

  return response;
});

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    const log = container.resolve('logger');
    log.info(`BFF server is running on http://localhost:${info.port}`);
  },
);
