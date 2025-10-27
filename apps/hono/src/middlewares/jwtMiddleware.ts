import { factory } from '@/factory';

export const jwtMiddleware = factory.createMiddleware(async (ctx, next) => {
  console.log(ctx.env);

  const authorizationHeader = ctx.req.raw.headers.get('Authorization');
  ctx.var.logger.debug('Authorization header', authorizationHeader);

  const jwt = authorizationHeader?.replace('Bearer ', '');

  try {
    const jwtPayload = await ctx.var.jwt.validateToken(jwt!);
    ctx.var.logger.debug('JWT', jwtPayload);

    ctx.set('user', jwtPayload as any);
  } catch (error) {
    ctx.var.logger.error('JWT', error);
    ctx.set('user', null);
  }

  return next();
});
