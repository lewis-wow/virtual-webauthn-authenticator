import { factory } from '@/factory';
import { apiKeyManager } from '@/lib/apiKeyManager';
import { auth } from '@/lib/auth';
import { jwtIssuer } from '@/lib/jwtIssuer';
import { prisma } from '@/lib/prisma';
import { requireAuthMiddleware } from '@/middlewares/requireAuthMiddleware';
import { sValidator } from '@hono/standard-validator';
import { TokenType } from '@repo/enums';
import { Unauthorized } from '@repo/exception';
import {
  CreateApiKeyRequestBodySchema,
  CreateApiKeyResponseSchema,
  DeleteApiKeyRequestParamSchema,
  DeleteApiKeyResponseSchema,
  GetApiKeyRequestParamSchema,
  GetApiKeyResponseSchema,
  ListApiKeysResponseSchema,
  UpdateApiKeyRequestBodySchema,
  UpdateApiKeyRequestParamSchema,
  UpdateApiKeyResponseSchema,
} from '@repo/validation';

export const apiKey = factory.createApp();

apiKey.post(
  '/',
  requireAuthMiddleware,
  sValidator('json', CreateApiKeyRequestBodySchema),
  async (ctx) => {
    const json = ctx.req.valid('json');

    const apiKey = await apiKeyManager.generate({
      userId: ctx.var.user!.id,
      name: json.name,
      permissions: json.permissions,
      metadata: json.metadata,
      expiresAt: json.expiresAt,
    });

    return ctx.json(CreateApiKeyResponseSchema.encode(apiKey));
  },
);

apiKey.get('/', requireAuthMiddleware, async (ctx) => {
  const apiKeys = await apiKeyManager.list({
    userId: ctx.var.user!.id,
  });

  return ctx.json(ListApiKeysResponseSchema.encode(apiKeys));
});

apiKey.get(
  '/:id',
  requireAuthMiddleware,
  sValidator('param', GetApiKeyRequestParamSchema),
  async (ctx) => {
    const param = ctx.req.valid('param');

    const apiKey = await apiKeyManager.get({
      userId: ctx.var.user!.id,
      id: param.id,
    });

    return ctx.json(GetApiKeyResponseSchema.encode(apiKey));
  },
);

apiKey.put(
  '/:id',
  requireAuthMiddleware,
  sValidator('param', UpdateApiKeyRequestParamSchema),
  sValidator('json', UpdateApiKeyRequestBodySchema),
  async (ctx) => {
    const param = ctx.req.valid('param');
    const json = ctx.req.valid('json');

    const apiKey = await apiKeyManager.update({
      userId: ctx.var.user!.id,
      id: param.id,
      data: {
        name: json.name,
        enabled: json.enabled,
        metadata: json.metadata,
        expiresAt: json.expiresAt,
        revokedAt: json.revokedAt,
      },
    });

    return ctx.json(UpdateApiKeyResponseSchema.encode(apiKey));
  },
);

apiKey.delete(
  '/:id',
  requireAuthMiddleware,
  sValidator('param', DeleteApiKeyRequestParamSchema),
  async (ctx) => {
    const param = ctx.req.valid('param');

    await apiKeyManager.delete({
      userId: ctx.var.user!.id,
      id: param.id,
    });

    return ctx.json(
      DeleteApiKeyResponseSchema.encode({
        success: true,
      }),
    );
  },
);

apiKey.get('/token', async (ctx) => {
  const bearerToken = ctx.req.header('Authorization');
  const plaintextKey = bearerToken?.replace('Bearer ', '');

  if (!plaintextKey) {
    throw new Unauthorized('API key is invalid.');
  }

  const apiKey = await apiKeyManager.verify(plaintextKey);

  if (!apiKey) {
    throw new Unauthorized('API key is invalid.');
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: apiKey.userId,
    },
  });

  return ctx.json({
    token: await jwtIssuer.sign({
      sub: apiKey.id,
      apiKey,
      user,
      tokenType: TokenType.API_KEY,
    }),
  });
});
