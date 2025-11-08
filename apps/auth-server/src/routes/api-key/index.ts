import { factory } from '@/factory';
import { apiKeyManager } from '@/lib/apiKeyManager';
import { auth } from '@/lib/auth';
import { jwtIssuer } from '@/lib/jwtIssuer';
import { prisma } from '@/lib/prisma';
import { requireAuthMiddleware } from '@/middlewares/requireAuthMiddleware';
import { sValidator } from '@hono/standard-validator';
import { contract } from '@repo/contract';
import { TokenType } from '@repo/enums';
import { Unauthorized } from '@repo/exception';

export const apiKey = factory.createApp();

apiKey.post(
  contract.api.auth.apiKeys.create.path,
  requireAuthMiddleware,
  sValidator('json', contract.api.auth.apiKeys.create.body),
  async (ctx) => {
    const json = ctx.req.valid('json');

    const apiKey = await apiKeyManager.generate({
      userId: ctx.var.user!.id,
      name: json.name,
      permissions: json.permissions,
      metadata: json.metadata,
      expiresAt: json.expiresAt,
    });

    return ctx.json(
      contract.api.auth.apiKeys.create.responses[200].encode(apiKey),
    );
  },
);

apiKey.get(
  contract.api.auth.apiKeys.list.path,
  requireAuthMiddleware,
  async (ctx) => {
    const apiKeys = await apiKeyManager.list({
      userId: ctx.var.user!.id,
    });

    return ctx.json(
      contract.api.auth.apiKeys.list.responses[200].encode(apiKeys),
    );
  },
);

apiKey.get(
  contract.api.auth.apiKeys.get.path,
  requireAuthMiddleware,
  sValidator('param', contract.api.auth.apiKeys.get.pathParams),
  async (ctx) => {
    const param = ctx.req.valid('param');

    const apiKey = await apiKeyManager.get({
      userId: ctx.var.user!.id,
      id: param.id,
    });

    return ctx.json(
      contract.api.auth.apiKeys.get.responses[200].encode(apiKey),
    );
  },
);

apiKey.put(
  contract.api.auth.apiKeys.update.path,
  requireAuthMiddleware,
  sValidator('param', contract.api.auth.apiKeys.update.pathParams),
  sValidator('json', contract.api.auth.apiKeys.update.body),
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

    return ctx.json(
      contract.api.auth.apiKeys.update.responses[200].encode(apiKey),
    );
  },
);

apiKey.delete(
  contract.api.auth.apiKeys.delete.path,
  requireAuthMiddleware,
  sValidator('param', contract.api.auth.apiKeys.delete.pathParams),
  async (ctx) => {
    const param = ctx.req.valid('param');

    await apiKeyManager.delete({
      userId: ctx.var.user!.id,
      id: param.id,
    });

    return ctx.json(
      contract.api.auth.apiKeys.delete.responses[200].encode({
        success: true,
      }),
    );
  },
);

apiKey.get(contract.api.auth.apiKeys.getToken.path, async (ctx) => {
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

  return ctx.json(
    contract.api.auth.apiKeys.getToken.responses[200].encode({
      token: await jwtIssuer.sign({
        sub: apiKey.id,
        apiKey,
        user,
        tokenType: TokenType.API_KEY,
      }),
    }),
  );
});
