import { factory } from '@/factory';
import { serveStatic } from '@hono/node-server/serve-static';

import { credentials } from './credentials';

export const root = factory.createApp();
root.use('*', serveStatic({ root: './static' }));
root.get('/', async (ctx) => {
  return ctx.text('OK');
});

root.route('/credentials', credentials);
