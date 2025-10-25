import { serve } from '@hono/node-server';
import { showRoutes } from 'hono/dev';

import { env } from './env.js';
import { root } from './routes/index.js';

serve(
  {
    fetch: root.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);

    showRoutes(root, {
      colorize: true,
    });
  },
);
