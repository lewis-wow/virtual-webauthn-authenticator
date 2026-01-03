import { serve } from '@hono/node-server';

import { container } from './container';
import { env } from './env';
import { app } from './routes';

const log = container.resolve('logger');

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    log.info(`Server is running on http://localhost:${info.port}`);
  },
);
