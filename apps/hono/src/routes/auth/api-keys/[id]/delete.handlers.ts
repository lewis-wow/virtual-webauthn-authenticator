import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { sValidator } from '@hono/standard-validator';
import {
  DeleteApiKeyRequestParamSchema,
  DeleteApiKeyResponseSchema,
} from '@repo/validation';

export const apiKeyDeleteHandlers = factory.createHandlers(
  sValidator('param', DeleteApiKeyRequestParamSchema),
  protectedMiddleware,
  async (ctx) => {
    const updateApiKeyRequestParam = ctx.req.valid('param');

    await ctx.var.apiKeyManager.expireApiKey({
      user: ctx.var.user,
      id: updateApiKeyRequestParam.id,
    });

    return ctx.json(
      DeleteApiKeyResponseSchema.encode({
        success: true,
      }),
    );
  },
);
