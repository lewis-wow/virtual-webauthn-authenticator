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
  const bffLogger = container.resolve('bffLogger');

  bffLogger.logRequest(ctx.req.raw);

  await next();

  bffLogger.logResponse(ctx.req.raw, ctx.res);
});

app.all('/api/*', async (ctx) => {
  const logger = ctx.get('container').resolve('logger');
  const tokenFetch = ctx.get('container').resolve('tokenFetch');

  const authorizationHeader = ctx.req.header('Authorization');
  const apiKey = authorizationHeader?.replace('Bearer ', '');

  let jwt: string | null = null;

  if (apiKey !== undefined) {
    logger.debug('API key', { apiKey });

    jwt = await tokenFetch.fetchToken(apiKey, { apiKey });

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
