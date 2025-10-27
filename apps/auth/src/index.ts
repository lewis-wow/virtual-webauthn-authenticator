import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { env } from './env.js';
import { auth } from './lib/auth.js';

const app = new Hono();

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
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
