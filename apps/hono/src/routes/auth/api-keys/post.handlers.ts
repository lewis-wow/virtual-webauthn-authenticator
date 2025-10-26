import { env } from '@/env';
import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { ApiKeyManager } from '@repo/api-key';
import {
  CreateApiKeyRequestBodySchema,
  CreateApiKeyResponseSchema,
} from '@repo/validation';
import { validator, resolver, describeRoute } from 'hono-openapi';

export const apiKeyPostHandlers = factory.createHandlers(
  describeRoute({
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(CreateApiKeyResponseSchema),
          },
        },
      },
    },
  }),
  validator('json', CreateApiKeyRequestBodySchema),
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
