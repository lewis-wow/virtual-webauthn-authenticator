import { serve } from '@hono/node-server';
import { BearerTokenMapper } from '@repo/auth/mappers';
import { proxy } from '@repo/proxy';
import { cors } from 'hono/cors';

import { container } from './container';
import { env } from './env';
import { factory } from './factory';

const CORS_ALLOW_ORIGINS = '*';
const API_ROUTE_PATTERN = '/api/*';

const app = factory.createApp();

app.use(
  '*',
  cors({
    origin: CORS_ALLOW_ORIGINS,
  }),
);

app.use(async (ctx, next) => {
  const container = ctx.get('container');
  const bffLogger = container.resolve('bffLogger');

  bffLogger.logRequest(ctx.req.raw);

  await next();

  bffLogger.logResponse(ctx.req.raw, ctx.res);
});

/**
 * Proxies API requests to the backend service.
 * Converts API keys to JWT tokens for authentication.
 */
app.all(API_ROUTE_PATTERN, async (ctx) => {
  const logger = ctx.get('container').resolve('logger');
  const tokenFetch = ctx.get('container').resolve('tokenFetch');

  const authorizationHeader = ctx.req.header('Authorization');
  const apiKey = BearerTokenMapper.tryFromBearerToken(authorizationHeader);

  let jwt: string | null = null;
  if (apiKey !== null) {
    logger.debug('API key', { apiKey });

    jwt = await tokenFetch.fetchToken(apiKey, { apiKey });

    logger.debug('JWT received', { jwt });
  }

  const response = await proxy(env.API_BASE_URL, ctx.req.raw, {
    headers: {
      Authorization: jwt ? BearerTokenMapper.toBearerToken(jwt) : null,
    },
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
