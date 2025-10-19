import { type FactoryEnv } from '@/factory';
import type { PermissionAction, ResourceType } from '@repo/prisma';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const hasAccess =
  (opts: {
    action: PermissionAction;
    resourceType: ResourceType;
    resourceId: string;
  }) =>
  async (ctx: Context<FactoryEnv, string, {}>, next: () => Promise<void>) => {
    if (ctx.var.user === null) {
      throw new HTTPException(401);
    }

    const hasAccess = await ctx.var.iamManager.hasAccess({
      action: opts.action,
      resourceType: opts.resourceType,
      resourceId: opts.resourceId,
    });

    if (!hasAccess) {
      throw new HTTPException(403);
    }

    return next();
  };
