import { serve } from '@hono/node-server';
import { Logger } from '@repo/logger';

import { env } from './env';
import { app } from './routes';

const LOG_PREFIX = 'AUTH-SERVER';

const log = new Logger({
  prefix: LOG_PREFIX,
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
