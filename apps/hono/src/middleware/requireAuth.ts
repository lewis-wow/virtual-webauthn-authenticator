import { prisma, type RoleName } from '@repo/prisma';
import { HTTPException } from 'hono/http-exception';

import { factory } from '../factory';

export const requireAuth = (roleName?: RoleName) =>
  factory.createMiddleware(async (ctx, next) => {
    if (!ctx.var.user) {
      throw new HTTPException(401);
    }

    if (roleName === undefined) {
      return next();
    }

    const rolesCount = await prisma.role.count({
      where: {
        name: roleName,
        userRoles: {
          some: {
            userId: ctx.var.user.id,
          },
        },
      },
    });

    if (rolesCount === 0) {
      throw new HTTPException(403);
    }

    return next();
  });
