import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { ApikeySchema, GetApiKeyRequestParamSchema } from '@repo/validation';
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi';

export const apiKeyGetHandlers = factory.createHandlers(
  describeRoute({
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(ApikeySchema),
          },
        },
      },
    },
  }),
  zValidator('param', GetApiKeyRequestParamSchema),
  protectedMiddleware,
  async (ctx) => {
    const getApiKeyRequestParam = ctx.req.valid('param');

    const apiKey = await ctx.var.auth.api.getApiKey({
      query: {
        id: getApiKeyRequestParam.id,
      },
      headers: ctx.req.raw.headers,
    });

    return ctx.json(ApikeySchema.parse(apiKey));
  },
);
