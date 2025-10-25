import { env } from '@/env';
import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { sValidator } from '@hono/standard-validator';
import { Handler, paths } from '@repo/contract';
import { ApikeySchema } from '@repo/validation';

export const apiKeyPostHandlers = factory.createHandlers(
  sValidator('json', Handler.json(paths['/auth/api-keys'].post)),
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

    const res = Handler.response(
      paths['/auth/api-keys'].post,
      200,
      'application/json',
    );

    return ctx.json(ApikeySchema.parse(apiKey));
  },
);
