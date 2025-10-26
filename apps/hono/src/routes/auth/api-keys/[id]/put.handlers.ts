import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import {
  UpdateApiKeyRequestBodySchema,
  UpdateApiKeyRequestParamSchema,
  UpdateApiKeyResponseSchema,
} from '@repo/validation';
import { validator, resolver, describeRoute } from 'hono-openapi';

export const apiKeyPutHandlers = factory.createHandlers(
  describeRoute({
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(UpdateApiKeyResponseSchema),
          },
        },
      },
    },
  }),
  validator('param', UpdateApiKeyRequestParamSchema),
  validator('json', UpdateApiKeyRequestBodySchema),
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
