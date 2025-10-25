import { env } from '@/env';
import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { sValidator } from '@hono/standard-validator';
import {
  CreateApiKeyRequestBodySchema,
  CreateApiKeyResponseSchema,
} from '@repo/validation';

export const apiKeyPostHandlers = factory.createHandlers(
  sValidator('json', CreateApiKeyRequestBodySchema),
  protectedMiddleware,
  async (ctx) => {
    const createApiKeyRequestBody = ctx.req.valid('json');

    const { apiKey, fullKey } = await ctx.var.apiKeyManager.generateApiKey({
      user: ctx.var.user,
      prefix: env.API_KEY_PREFIX,
      name: createApiKeyRequestBody.name,
    });

    return ctx.json(CreateApiKeyResponseSchema.encode({ apiKey, fullKey }));
  },
);
