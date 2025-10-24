import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import {
  ApikeySchema,
  UpdateApiKeyRequestBodySchema,
  UpdateApiKeyRequestParamSchema,
} from '@repo/validation';
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi';

export const apiKeyPutHandlers = factory.createHandlers(
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
  zValidator('param', UpdateApiKeyRequestParamSchema),
  zValidator('json', UpdateApiKeyRequestBodySchema),
  protectedMiddleware,
  async (ctx) => {
    const updateApiKeyRequestParam = ctx.req.valid('param');
    const updateApiKeyRequestBody = ctx.req.valid('json');

    const apiKey = await ctx.var.auth.api.updateApiKey({
      body: {
        keyId: updateApiKeyRequestParam.id,
        ...updateApiKeyRequestBody,
      },
      headers: ctx.req.raw.headers,
    });

    return ctx.json(ApikeySchema.parse(apiKey));
  },
);
