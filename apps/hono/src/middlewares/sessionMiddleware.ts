import { factory } from '@/factory';

export const sessionMiddleware = factory.createMiddleware(async (ctx, next) => {
  console.log('headers', ctx.req.raw.headers);
  const session = await ctx.var.auth.api.getSession({
    headers: ctx.req.raw.headers,
  });

  console.log('session', session);

  if (!session) {
    ctx.set('user', null);
    ctx.set('session', null);
    return next();
  }

  ctx.set('user', session.user);
  ctx.set('session', session.session);
  return next();
});
