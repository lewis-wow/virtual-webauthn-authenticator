import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { sValidator } from '@hono/standard-validator';
import {
  UpdateApiKeyRequestBodySchema,
  UpdateApiKeyRequestParamSchema,
  UpdateApiKeyResponseSchema,
} from '@repo/validation';

export const apiKeyPutHandlers = factory.createHandlers(
  sValidator('param', UpdateApiKeyRequestParamSchema),
  sValidator('json', UpdateApiKeyRequestBodySchema),
  protectedMiddleware,
  async (ctx) => {
    const updateApiKeyRequestParam = ctx.req.valid('param');
    const updateApiKeyRequestBody = ctx.req.valid('json');

    const apiKey = await ctx.var.apiKeyManager.updateApiKeyOrThrow({
      user: ctx.var.user,
      id: updateApiKeyRequestParam.id,
      data: updateApiKeyRequestBody,
    });

    return ctx.json(UpdateApiKeyResponseSchema.encode(apiKey));
  },
);
