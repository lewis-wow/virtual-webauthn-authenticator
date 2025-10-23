import type { User } from '@repo/prisma';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const __mockUserMiddleware = createMiddleware<{
  Variables: { user: Pick<User, 'id'> };
}>(async (ctx, next) => {
  ctx.set('user', { id: 'test' });
  return next();
});

export const protectedMiddleware = createMiddleware<{
  Variables: { user: Pick<User, 'id'> };
}>((ctx, next) => {
  if (ctx.var.user === null) {
    throw new HTTPException(401);
  }

  return next();
});
