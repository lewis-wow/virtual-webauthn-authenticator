import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { sValidator } from '@hono/standard-validator';
import {
  GetApiKeyRequestParamSchema,
  GetApiKeyResponseSchema,
} from '@repo/validation';

export const apiKeyGetHandlers = factory.createHandlers(
  sValidator('param', GetApiKeyRequestParamSchema),
  protectedMiddleware,
  async (ctx) => {
    const getApiKeyRequestParam = ctx.req.valid('param');

    const apiKey = await ctx.var.apiKeyManager.getApiKeyOrThrow({
      user: ctx.var.user,
      id: getApiKeyRequestParam.id,
    });

    return ctx.json(GetApiKeyResponseSchema.encode(apiKey));
  },
);
