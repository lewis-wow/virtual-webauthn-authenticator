import { factory } from '@/factory';

export const sessionMiddleware = factory.createMiddleware(async (ctx, next) => {
  const fullApiKey = ctx.req.raw.headers
    .get('authorization')
    ?.replace('Bearer ', '');

  const apiKey = await ctx.var.apiKeyManager.verifyApiKey({
    fullApiKey: fullApiKey!,
  });

  if (!apiKey) {
    ctx.set('user', null);
    return next();
  }

  ctx.set('user', apiKey.user);
  return next();
});
