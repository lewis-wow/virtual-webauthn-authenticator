import { serve } from '@hono/node-server';
import { HTTPException } from '@repo/exception';
import { showRoutes } from 'hono/dev';

import { env } from './env.js';
import { factory } from './factory.js';
import { root } from './routes';

const app = factory
  .createApp()
  .onError((error) => {
    if (error instanceof HTTPException) {
      return error.toResponse();
    }

    throw error;
  })
  .route('/', root);

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
