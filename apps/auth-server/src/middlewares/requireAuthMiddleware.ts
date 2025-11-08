import { factory } from '@/factory';
import { Unauthorized } from '@repo/exception';

export const requireAuthMiddleware = factory.createMiddleware((ctx, next) => {
  if (ctx.var.session === null || ctx.var.user === null) {
    throw new Unauthorized();
  }

  return next();
});
