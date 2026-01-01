import { container } from '@/container';
import { factory } from '@/factory';

import { apiKey } from './api-keys';

export const app = factory.createApp().use('*', async (ctx, next) => {
  const auth = container.resolve('auth');
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
  const jwtIssuer = c.get('container').resolve('jwtIssuer');
  return c.json(await jwtIssuer.jsonWebKeySet());
});

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  const auth = c.get('container').resolve('auth');
  return auth.handler(c.req.raw);
});
