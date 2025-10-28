import { factory } from '@/factory';
import { jwtMiddleware } from '@/middlewares/jwtMiddleware';
import { resolver, describeRoute } from 'hono-openapi';
import z from 'zod';

export const healthCheckGetHandlers = factory.createHandlers(
  describeRoute({
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(z.object({ healthy: z.literal(true) })),
          },
        },
      },
    },
  }),
  jwtMiddleware,
  async (ctx) => {
    return ctx.json({
      healthy: true,
      user: ctx.var.user,
    });
  },
);
