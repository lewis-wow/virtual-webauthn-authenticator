import { factory } from '@/factory';
import { validateToken } from '@/validateToken';

export const jwtMiddleware = factory.createMiddleware(async (ctx, next) => {
  const jwt = ctx.req.raw.headers.get('Authorization')?.replace('Bearer ', '');

  console.log({ jwt });
  try {
    const jwtPayload = await validateToken(jwt!);
    ctx.set('user', jwtPayload as any);
  } catch (error) {
    console.error(error);
    ctx.set('user', null);
  }

  return next();
});
