import { env } from '@/env';
import { factory } from '@/factory';
import { prisma } from '@/lib/prisma';
import type { Env, MiddlewareHandler } from 'hono';
import { validator as zValidator } from 'hono-openapi';
import { every } from 'hono/combine';
import { jwt as honoJwt } from 'hono/jwt';
import z from 'zod';

export const jwt: MiddlewareHandler<
  Env,
  string,
  {
    in: {
      header: {
        Authorization: string;
      };
    };
    out: {
      header: {
        Authorization: string;
      };
    };
  }
> = every(
  zValidator(
    'header',
    z.object({
      authorization: z
        .string()
        // 1. Check if the string starts with the required prefix.
        .refine((val) => val.startsWith('Bearer '), {
          message: "Authorization header must start with 'Bearer '",
        })
        // 2. Extract just the token part from the string.
        .transform((val) => val.slice(7))
        // 3. Validate the extracted token against the JWT schema.
        .pipe(z.jwt()),
    }),
  ),
  honoJwt({ secret: env.JWT_SECRET }),
  factory.createMiddleware(async (ctx, next) => {
    const jwtPayload = ctx.get('jwtPayload');

    const user = await prisma.user.findFirst({
      where: {
        id: jwtPayload.sub,
      },
    });

    ctx.set('user', user);

    return next();
  }),
);
