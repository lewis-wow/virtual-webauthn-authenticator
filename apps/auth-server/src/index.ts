import { serve } from '@hono/node-server';
import { HTTPExceptionCode } from '@repo/enums';
import { HTTPException } from '@repo/exception';
import { Hono } from 'hono';

import { env } from './env';
import { auth } from './lib/auth';
import { jwt } from './lib/jwt';

const app = new Hono();

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

app.get('/.well-known/jwks.json', async (c) => {
  return c.json(await jwt.getKeys());
});

app.get('/api/auth/api-key/token', async (c) => {
  const bearerToken = c.req.header('Authorization');
  const apiKey = bearerToken?.replace('Bearer ', '');

  if (!apiKey) {
    throw new HTTPException({
      status: 401,
      code: HTTPExceptionCode.UNAUTHORIZED,
    });
  }

  const data = await auth.api.verifyApiKey({
    body: {
      key: apiKey,
    },
  });

  if (!data.valid || data.error) {
    throw new HTTPException({
      status: 401,
      code: HTTPExceptionCode.UNAUTHORIZED,
    });
  }

  return c.json({
    token: await jwt.sign({
      sub: data.key!.id,
      id: data.key!.id,
      permissions: data.key?.permissions,
      tokenType: 'API_KEY',
    }),
  });
});

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Auth server is running on http://localhost:${info.port}`);
  },
);
