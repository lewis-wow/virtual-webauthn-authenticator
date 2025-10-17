import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Environment } from '@repo/enums';
import { Hono } from 'hono';

import { env } from './env.js';
import { prisma } from './prisma.js';

const app = new Hono();

app.use('*', serveStatic({ root: './static' }));

app.get('/', (c) => {
  console.log(prisma, Environment);
  return c.text('Hello Hono!');
});

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
