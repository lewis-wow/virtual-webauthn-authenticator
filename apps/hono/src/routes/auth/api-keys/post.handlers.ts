import { env } from '@/env';
import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { sValidator } from '@hono/standard-validator';
import { ApiKeyManager } from '@repo/api-key';
import {
  CreateApiKeyRequestBodySchema,
  CreateApiKeyResponseSchema,
} from '@repo/validation';

export const apiKeyPostHandlers = factory.createHandlers(
  sValidator('json', CreateApiKeyRequestBodySchema),
  protectedMiddleware,
  async (ctx) => {
    const createApiKeyRequestBody = ctx.req.valid('json');

    const { apiKey, secret } =
      await ctx.var.apiKeyManager.generateExternalApiKey({
        user: ctx.var.user,
        prefix: env.API_KEY_PREFIX,
        name: createApiKeyRequestBody.name,
      });

    return ctx.json(
      CreateApiKeyResponseSchema.encode({
        apiKey,
        fullKey: ApiKeyManager.getFullApiKey({
          prefix: apiKey.prefix,
          secret,
        }),
      }),
    );
  },
);
