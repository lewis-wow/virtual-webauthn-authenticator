import { factory } from '@/factory';
import { validateToken } from '@/validateToken';
import { Jwt } from '@repo/jwt';

export const sessionMiddleware = factory.createMiddleware(async (ctx, next) => {
  const jwtOrfullApiKey = ctx.req.raw.headers
    .get('authorization')
    ?.replace('Bearer ', '');

  const validated = await validateToken(jwtOrfullApiKey!);
  ctx.set('user', validated as any);

  console.log('validated', validated);
  return next();

  if (!jwtOrfullApiKey) {
    ctx.set('user', null);
    return next();
  }

  if (Jwt.isJwt(jwtOrfullApiKey)) {
    const jwtPayload = await ctx.var.jwt.verify(jwtOrfullApiKey);

    if (!jwtPayload) {
      ctx.set('user', null);
      return next();
    }

    const user = await ctx.var.prisma.user.findUnique({
      where: {
        id: jwtPayload.id,
      },
    });

    ctx.set('user', user);
    return next();
  }

  const apiKey = await ctx.var.apiKeyManager.verifyApiKey({
    fullApiKey: jwtOrfullApiKey,
  });

  console.log({ apiKey });

  ctx.set('user', apiKey?.user ?? null);
  return next();
});
