import { env } from '@/env';
import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { ApikeySchema, CreateApiKeyRequestBodySchema } from '@repo/validation';
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi';

export const apiKeyPostHandlers = factory.createHandlers(
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
  zValidator('json', CreateApiKeyRequestBodySchema),
  protectedMiddleware,
  async (ctx) => {
    const createApiKeyRequestBody = ctx.req.valid('json');

    const apiKey = await ctx.var.auth.api.createApiKey({
      body: {
        ...createApiKeyRequestBody,
        prefix: env.API_KEY_PREFIX,
      },
      headers: ctx.req.raw.headers,
    });

    return ctx.json(ApikeySchema.parse(apiKey));
  },
);
