import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { ListApiKeysResponseSchema } from '@repo/validation';
import { resolver, describeRoute } from 'hono-openapi';

export const apiKeysListHandlers = factory.createHandlers(
  describeRoute({
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(ListApiKeysResponseSchema),
          },
        },
      },
    },
  }),
  protectedMiddleware,
  async (ctx) => {
    const apiKeys = await ctx.var.apiKeyManager.listApiKeys({
      user: ctx.var.user,
    });

    return ctx.json(ListApiKeysResponseSchema.encode(apiKeys));
  },
);
