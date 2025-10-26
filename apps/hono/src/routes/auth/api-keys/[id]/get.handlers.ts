import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import {
  GetApiKeyRequestParamSchema,
  GetApiKeyResponseSchema,
} from '@repo/validation';
import { validator, resolver, describeRoute } from 'hono-openapi';

export const apiKeyGetHandlers = factory.createHandlers(
  describeRoute({
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(GetApiKeyResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', GetApiKeyRequestParamSchema),
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
