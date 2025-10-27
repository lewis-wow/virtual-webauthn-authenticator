import { serve } from '@hono/node-server';
import { showRoutes } from 'hono/dev';

import { env } from './env.js';
import { factory } from './factory.js';
import { root } from './routes/index.js';

const app = factory.createApp().basePath('/api');

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`API Server is running on http://localhost:${info.port}`);

    showRoutes(app, {
      colorize: true,
    });
  },
);
