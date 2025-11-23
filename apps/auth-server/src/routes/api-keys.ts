import { factory } from '@/factory';
import { apiKeyManager } from '@/lib/apiKeyManager';
import { auth } from '@/lib/auth';
import { jwtIssuer } from '@/lib/jwtIssuer';
import { prisma } from '@/lib/prisma';
import { requireAuthMiddleware } from '@/middlewares/requireAuthMiddleware';
import { sValidator } from '@hono/standard-validator';
import { TokenType } from '@repo/auth/enums';
import { contract } from '@repo/contract';
import {
  CreateApiKeyResponseSchema,
  DeleteApiKeyResponseSchema,
  GetApiKeyResponseSchema,
  GetTokenApiKeysResponseSchema,
  ListApiKeysResponseSchema,
  UpdateApiKeyResponseSchema,
} from '@repo/contract/validation';
import { Unauthorized } from '@repo/exception/http';
import { add } from 'date-fns';
import { Schema } from 'effect';

export const apiKey = factory.createApp();

apiKey.on(
  [contract.api.auth.apiKeys.getToken.method],
  contract.api.auth.apiKeys.getToken.path,
  async (ctx) => {
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

    const token = await jwtIssuer.sign({
      sub: apiKey.id,
      apiKeyId: apiKey.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      permissions: apiKey.permissions,
      tokenType: TokenType.API_KEY,
    });

    return ctx.json(
      Schema.encodeSync(GetTokenApiKeysResponseSchema)({ token }),
    );
  },
);

apiKey.post(
  contract.api.auth.apiKeys.create.path,
  requireAuthMiddleware,
  sValidator('json', contract.api.auth.apiKeys.create.body),
  async (ctx) => {
    const json = ctx.req.valid('json');

    const expiresAt = json.expiresAt ? add(new Date(), json.expiresAt) : null;

    const apiKey = await apiKeyManager.generate({
      userId: ctx.var.user!.id,
      name: json.name,
      permissions: json.permissions,
      expiresAt,
    });

    return ctx.json(Schema.encodeSync(CreateApiKeyResponseSchema)(apiKey));
  },
);

apiKey.get(
  contract.api.auth.apiKeys.list.path,
  requireAuthMiddleware,
  async (ctx) => {
    const apiKeys = await apiKeyManager.list({
      userId: ctx.var.user!.id,
    });

    return ctx.json(Schema.encodeSync(ListApiKeysResponseSchema)(apiKeys));
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

    return ctx.json(Schema.encodeSync(GetApiKeyResponseSchema)(apiKey));
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
        expiresAt: json.expiresAt,
        revokedAt: json.revokedAt,
      },
    });

    return ctx.json(Schema.encodeSync(UpdateApiKeyResponseSchema)(apiKey));
  },
);

apiKey.delete(
  contract.api.auth.apiKeys.delete.path,
  requireAuthMiddleware,
  sValidator('param', contract.api.auth.apiKeys.delete.pathParams),
  async (ctx) => {
    const param = ctx.req.valid('param');

    const apiKey = await apiKeyManager.delete({
      userId: ctx.var.user!.id,
      id: param.id,
    });

    return ctx.json(Schema.encodeSync(DeleteApiKeyResponseSchema)(apiKey));
  },
);
