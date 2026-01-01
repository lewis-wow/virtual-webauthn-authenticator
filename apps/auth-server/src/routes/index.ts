import { container } from '@/container';
import { env } from '@/env';
import { factory } from '@/factory';
import { cors } from 'hono/cors';

import { apiKey } from './api-keys';

export const app = factory
  .createApp()
  .use(
    '*',
    cors({
      origin: (origin) => {
        // Allow requests from browser extensions
        if (
          origin.startsWith('chrome-extension://') ||
          origin.startsWith('moz-extension://')
        ) {
          return origin;
        }

        // Check if origin is in trusted origins
        if (
          env.TRUSTED_ORIGINS.some((trusted) => {
            // Handle wildcard patterns
            if (trusted.includes('*')) {
              const pattern = trusted.replace(/\*/g, '.*');
              return new RegExp(`^${pattern}$`).test(origin);
            }
            return trusted === origin;
          })
        ) {
          return origin;
        }

        return env.TRUSTED_ORIGINS[0] || origin;
      },
      credentials: true,
      allowHeaders: ['Content-Type', 'Authorization', 'X-Auth-Type'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  )
  .use('*', async (ctx, next) => {
    ctx.set('container', container);

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
