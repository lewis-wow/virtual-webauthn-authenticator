import { serve } from '@hono/node-server';
import { proxy } from '@repo/proxy';
import { omitUndefined } from '@repo/utils';
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

app.all('/api/*', async (ctx) => {
  const logger = ctx.get('container').resolve('logger');

  const authorizationHeader = ctx.req.header('Authorization');
  const apiKey = authorizationHeader?.replace('Bearer ', '');
  let jwt: string | undefined = undefined;

  logger.info('API key', { apiKey });

  if (apiKey !== undefined) {
    const response = await fetch(
      `http://localhost:3002/api/auth/api-keys/token`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      return undefined;
    }

    const { token } = (await response.json()) as { token: string };

    jwt = token;
  }

  logger.info('Token', { jwt });

  const response = await proxy('http://localhost:3001', ctx.req.raw, {
    headers: new Headers(
      omitUndefined({
        Authorization: jwt ? `Bearer ${jwt}` : undefined,
      }),
    ),
  });

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
    log.info(`Server is running on http://localhost:${info.port}`);
  },
);
