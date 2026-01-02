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
    origin: '*',
  }),
);

app.use(async (ctx, next) => {
  const container = ctx.get('container');
  const logger = container.resolve('logger');

  logger.debug('Proxy request', {
    url: ctx.req.url,
    method: ctx.req.method,
    headers: Object.fromEntries(ctx.req.raw.headers.entries()),
  });

  await next();

  logger.debug('Proxy response', {
    url: ctx.req.url,
    method: ctx.req.method,
    status: ctx.res.status,
    headers: Object.fromEntries(ctx.res.headers.entries()),
  });
});

app.all('/api/*', async (ctx) => {
  const logger = ctx.get('container').resolve('logger');
  const jwtFetcher = ctx.get('container').resolve('jwtFetcher');

  const authorizationHeader = ctx.req.header('Authorization');
  const apiKey = authorizationHeader?.replace('Bearer ', '');

  let jwt: string | null = null;

  if (apiKey !== undefined) {
    logger.debug('API key', { apiKey });

    jwt = await jwtFetcher.fetchJwtToken(apiKey);

    logger.debug('JWT received', { jwt });
  }

  const response = await proxy('http://localhost:3001', ctx.req.raw, {
    headers: new Headers({
      Authorization: `Bearer ${jwt}`,
    }),
  });

  return response;
});

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
