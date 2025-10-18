import { serveStatic } from '@hono/node-server/serve-static';

import { factory } from '../factory';
import { auth } from './auth';
import { credentials } from './credentials';

export const root = factory
  .createApp()
  .use('*', serveStatic({ root: './static' }))
  .get('/', async (ctx) => {
    return ctx.text('OK');
  })
  .route('/auth', auth)
  .route('/credentials', credentials);
