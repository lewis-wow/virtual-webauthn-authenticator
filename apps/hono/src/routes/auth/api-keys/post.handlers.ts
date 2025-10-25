import { env } from '@/env';
import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { sValidator } from '@hono/standard-validator';
import { Handler, paths } from '@repo/contract';

export const apiKeyPostHandlers = factory.createHandlers(
  sValidator('json', Handler.json(paths['/auth/api-keys'].post)),
  protectedMiddleware,
  async (ctx) => {
    const createApiKeyRequestBody = ctx.req.valid('json');

    const { apiKey, fullKey } = await ctx.var.apiKeyManager.generateApiKey({
      user: ctx.var.user,
      prefix: env.API_KEY_PREFIX,
      name: createApiKeyRequestBody.name,
    });

    return ctx.json(
      Handler.response(paths['/auth/api-keys'].post).encode({
        ...apiKey,
        name: apiKey.name!,
        start: apiKey.start!,
        prefix: apiKey.prefix!,
      }),
    );
  },
);
