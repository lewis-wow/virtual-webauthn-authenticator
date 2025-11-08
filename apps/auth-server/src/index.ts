import { serve } from '@hono/node-server';
import { HTTPExceptionCode, TokenType } from '@repo/enums';
import { HTTPException } from '@repo/exception';
import { Logger } from '@repo/logger';
import { Hono } from 'hono';

import { env } from './env';
import { apiKeyManager } from './lib/apiKeyManager';
import { auth } from './lib/auth';
import { jwtIssuer } from './lib/jwtIssuer';

const LOG_PREFIX = 'AUTH-SERVER';

const log = new Logger({
  prefix: LOG_PREFIX,
});

const app = new Hono();

app.get('/api/auth/api-key/token', async (c) => {
  const bearerToken = c.req.header('Authorization');
  const plaintextKey = bearerToken?.replace('Bearer ', '');

  if (!plaintextKey) {
    throw new HTTPException({
      status: 401,
      code: HTTPExceptionCode.UNAUTHORIZED,
    });
  }

  const apiKey = await apiKeyManager.verify(plaintextKey);

  if (!apiKey) {
    throw new HTTPException({
      status: 401,
      code: HTTPExceptionCode.UNAUTHORIZED,
    });
  }

  return c.json({
    token: await jwtIssuer.sign({
      sub: apiKey.id,
      apiKey,
      tokenType: TokenType.API_KEY,
    }),
  });
});

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

app.get('/.well-known/jwks.json', async (c) => {
  return c.json(await jwtIssuer.getKeys());
});

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    log.info(`Auth server is running on http://localhost:${info.port}`);
  },
);
