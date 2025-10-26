import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { ListApiKeysResponseSchema } from '@repo/validation';
import z from 'zod';

export const apiKeysListHandlers = factory.createHandlers(
  protectedMiddleware,
  async (ctx) => {
    const apiKeys = await ctx.var.apiKeyManager.listApiKeys({
      user: ctx.var.user,
    });

    return ctx.json(ListApiKeysResponseSchema.encode(apiKeys));
  },
);
