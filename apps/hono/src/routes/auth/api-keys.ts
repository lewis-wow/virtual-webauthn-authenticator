import { factory } from '@/factory';
import { requireAuth } from '@/middleware/requireAuth';
import { zValidator } from '@hono/zod-validator';
import { auth } from '@repo/better-auth';
import '@repo/validation';
import {
  CreateApiKeyBodyRequestSchema,
  DeleteApiKeyParamRequestSchema,
  GetApiKeyParamRequestSchema,
  UpdateApiKeyBodyRequestSchema,
  UpdateApiKeyParamRequestSchema,
} from '@repo/validation';

export const apiKeys = factory.createApp().use(requireAuth());

apiKeys.get('/', async (ctx) => {
  const result = await auth.api.listApiKeys({
    headers: ctx.req.raw.headers,
  });

  return ctx.json(result);
});

apiKeys.post(
  '/',
  zValidator('json', CreateApiKeyBodyRequestSchema),
  async (ctx) => {
    const { name, expiresIn } = ctx.req.valid('json');

    const result = await auth.api.createApiKey({
      body: {
        name,
        expiresIn: expiresIn,
        userId: ctx.var.user?.id,
        prefix: 'virtual-webauthn-authenticator',
      },
    });

    return ctx.json(result);
  },
);

apiKeys.get(
  '/:id',
  zValidator('param', GetApiKeyParamRequestSchema),
  async (ctx) => {
    const { id } = ctx.req.valid('param');

    const result = await auth.api.getApiKey({
      query: {
        id,
      },
    });

    return ctx.json(result);
  },
);

apiKeys.put(
  '/:id',
  zValidator('param', UpdateApiKeyParamRequestSchema),
  zValidator('json', UpdateApiKeyBodyRequestSchema),
  async (ctx) => {
    const { id: keyId } = ctx.req.valid('param');
    const { name, expiresIn } = ctx.req.valid('json');

    const result = await auth.api.updateApiKey({
      body: {
        keyId,
        userId: ctx.var.user?.id,
        name,
        expiresIn,
      },
    });

    return ctx.json(result);
  },
);

apiKeys.delete(
  '/:id',
  zValidator('param', DeleteApiKeyParamRequestSchema),
  async (ctx) => {
    const { id: keyId } = ctx.req.valid('param');

    const result = await auth.api.deleteApiKey({
      body: {
        keyId,
      },
    });

    return ctx.json(result);
  },
);
