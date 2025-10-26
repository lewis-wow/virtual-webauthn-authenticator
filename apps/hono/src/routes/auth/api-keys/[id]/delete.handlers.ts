import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import {
  DeleteApiKeyRequestParamSchema,
  DeleteApiKeyResponseSchema,
} from '@repo/validation';
import { validator, resolver, describeRoute } from 'hono-openapi';

export const apiKeyDeleteHandlers = factory.createHandlers(
  describeRoute({
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(DeleteApiKeyResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', DeleteApiKeyRequestParamSchema),
  protectedMiddleware,
  async (ctx) => {
    const updateApiKeyRequestParam = ctx.req.valid('param');

    await ctx.var.apiKeyManager.expireApiKey({
      user: ctx.var.user,
      id: updateApiKeyRequestParam.id,
    });

    return ctx.json(
      DeleteApiKeyResponseSchema.encode({
        success: true,
      }),
    );
  },
);
