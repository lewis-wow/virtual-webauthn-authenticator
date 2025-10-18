import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Environment } from '@repo/enums';
import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';

import { env } from './env.js';
import { prisma } from './prisma.js';
import { credentials } from './routes/credentials.js';

const app = new Hono();

app.get('/', async (ctx) => {
  console.log(prisma);

  ctx.text('OK');
});

app.use('*', serveStatic({ root: './static' }));

app.route('/credentials', credentials);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);

    showRoutes(app, {
      verbose: true,
      colorize: true,
    });
  },
);
