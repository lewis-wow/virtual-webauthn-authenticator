import { factory } from '@/factory';
import { auth } from '@/lib/auth';
import { jwtIssuer } from '@/lib/jwtIssuer';

import { apiKey } from './api-keys';

export const app = factory.createApp().use('*', async (ctx, next) => {
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

  if (!session) {
    ctx.set('user', null);
    ctx.set('session', null);
    await next();

    return;
  }

  ctx.set('user', session.user);
  ctx.set('session', session.session);
  await next();
});

app.route('/', apiKey);

app.get('/.well-known/jwks.json', async (c) => {
  return c.json(await jwtIssuer.jsonWebKeySet());
});

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});
