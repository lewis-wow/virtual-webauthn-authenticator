import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { ApikeySchema } from '@repo/validation';
import { describeRoute, resolver } from 'hono-openapi';
import z from 'zod';

export const apiKeysListHandlers = factory.createHandlers(
  describeRoute({
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(z.array(ApikeySchema)),
          },
        },
      },
    },
  }),
  protectedMiddleware,
  async (ctx) => {
    const apiKeys = await ctx.var.auth.api.listApiKeys({
      headers: ctx.req.raw.headers,
    });

    return ctx.json(z.array(ApikeySchema).parse(apiKeys));
  },
);
