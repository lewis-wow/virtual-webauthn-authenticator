import { Unathorized } from '@repo/exception';
import type { User } from '@repo/prisma';
import { createMiddleware } from 'hono/factory';

export const protectedMiddleware = createMiddleware<{
  Variables: { user: Pick<User, 'id'> };
}>((ctx, next) => {
  if (ctx.var.user === null) {
    throw new Unathorized('User is not authorized.');
  }

  return next();
});
