import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import {
  DeleteResponseSchema,
  UpdateApiKeyRequestParamSchema,
} from '@repo/validation';
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi';

export const apiKeyDeleteHandlers = factory.createHandlers(
  describeRoute({
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(DeleteResponseSchema),
          },
        },
      },
    },
  }),
  zValidator('param', UpdateApiKeyRequestParamSchema),
  protectedMiddleware,
  async (ctx) => {
    const updateApiKeyRequestParam = ctx.req.valid('param');

    const result = await ctx.var.auth.api.deleteApiKey({
      body: {
        keyId: updateApiKeyRequestParam.id,
      },
      headers: ctx.req.raw.headers,
    });

    return ctx.json(DeleteResponseSchema.parse(result));
  },
);
