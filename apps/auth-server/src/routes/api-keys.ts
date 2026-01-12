import { factory } from '@/factory';
import { requireAuthMiddleware } from '@/middlewares/requireAuthMiddleware';
import { sValidator } from '@hono/standard-validator';
import { LogAction, LogEntity } from '@repo/activity-log/enums';
import { TokenType } from '@repo/auth/enums';
import { authServerContract } from '@repo/contract/auth-server';
import {
  CreateApiKeyResponseSchema,
  DeleteApiKeyResponseSchema,
  GetApiKeyResponseSchema,
  GetTokenApiKeyResponseSchema,
  ListApiKeysResponseSchema,
  UpdateApiKeyResponseSchema,
} from '@repo/contract/dto';
import { Unauthorized } from '@repo/exception/http';
import { add } from 'date-fns';

export const apiKey = factory.createApp();

apiKey.on(
  [authServerContract.api.auth.apiKeys.getToken.method],
  authServerContract.api.auth.apiKeys.getToken.path,
  async (ctx) => {
    const container = ctx.get('container');
    const apiKeyManager = container.resolve('apiKeyManager');
    const jwtIssuer = container.resolve('jwtIssuer');
    const prisma = container.resolve('prisma');

    const bearerToken = ctx.req.header('Authorization');
    const plaintextKey = bearerToken?.replace('Bearer ', '');

    if (!plaintextKey) {
      throw new Unauthorized();
    }

    const apiKey = await apiKeyManager.verify(plaintextKey);

    if (!apiKey) {
      throw new Unauthorized();
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: apiKey.userId,
      },
    });

    const token = await jwtIssuer.sign({
      apiKeyId: apiKey.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      permissions: apiKey.permissions,
      tokenType: TokenType.API_KEY,
      metadata: apiKey.metadata,
    });

    return ctx.json(GetTokenApiKeyResponseSchema.encode({ token }));
  },
);

apiKey.post(
  authServerContract.api.auth.apiKeys.create.path,
  requireAuthMiddleware,
  sValidator('json', authServerContract.api.auth.apiKeys.create.body),
  async (ctx) => {
    const container = ctx.get('container');
    const apiKeyManager = container.resolve('apiKeyManager');
    const activityLog = container.resolve('activityLog');

    const json = ctx.req.valid('json');

    const expiresAt = json.expiresAt ? add(new Date(), json.expiresAt) : null;

    const apiKey = await apiKeyManager.generate({
      userId: ctx.var.user!.id,
      name: json.name,
      permissions: json.permissions,
      expiresAt,
    });

    await activityLog.audit({
      entity: LogEntity.API_KEY,
      action: LogAction.CREATE,
      entityId: apiKey.apiKey.id,

      userId: ctx.var.user!.id,

      metadata: {
        name: apiKey.apiKey.name,
        permissions: apiKey.apiKey.permissions,
        expiresAt: apiKey.apiKey.expiresAt,
        revokedAt: apiKey.apiKey.revokedAt,
      },
    });

    return ctx.json(CreateApiKeyResponseSchema.encode(apiKey));
  },
);

apiKey.get(
  authServerContract.api.auth.apiKeys.list.path,
  requireAuthMiddleware,
  async (ctx) => {
    const container = ctx.get('container');
    const apiKeyManager = container.resolve('apiKeyManager');

    const apiKeys = await apiKeyManager.list({
      userId: ctx.var.user!.id,
    });

    return ctx.json(ListApiKeysResponseSchema.encode(apiKeys));
  },
);

apiKey.get(
  authServerContract.api.auth.apiKeys.get.path,
  requireAuthMiddleware,
  sValidator('param', authServerContract.api.auth.apiKeys.get.pathParams),
  async (ctx) => {
    const container = ctx.get('container');
    const apiKeyManager = container.resolve('apiKeyManager');

    const param = ctx.req.valid('param');

    const apiKey = await apiKeyManager.get({
      userId: ctx.var.user!.id,
      id: param.id,
    });

    return ctx.json(GetApiKeyResponseSchema.encode(apiKey));
  },
);

apiKey.put(
  authServerContract.api.auth.apiKeys.update.path,
  requireAuthMiddleware,
  sValidator('param', authServerContract.api.auth.apiKeys.update.pathParams),
  sValidator('json', authServerContract.api.auth.apiKeys.update.body),
  async (ctx) => {
    const container = ctx.get('container');
    const apiKeyManager = container.resolve('apiKeyManager');
    const activityLog = container.resolve('activityLog');

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

    await activityLog.audit({
      entity: LogEntity.API_KEY,
      action: LogAction.UPDATE,
      entityId: apiKey.id,

      userId: ctx.var.user!.id,

      metadata: {
        name: apiKey.name,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        revokedAt: apiKey.revokedAt,
      },
    });

    return ctx.json(UpdateApiKeyResponseSchema.encode(apiKey));
  },
);

apiKey.delete(
  authServerContract.api.auth.apiKeys.delete.path,
  requireAuthMiddleware,
  sValidator('param', authServerContract.api.auth.apiKeys.delete.pathParams),
  async (ctx) => {
    const container = ctx.get('container');
    const apiKeyManager = container.resolve('apiKeyManager');
    const activityLog = container.resolve('activityLog');

    const param = ctx.req.valid('param');

    const apiKey = await apiKeyManager.delete({
      userId: ctx.var.user!.id,
      id: param.id,
    });

    await activityLog.audit({
      entity: LogEntity.API_KEY,
      action: LogAction.DELETE,
      entityId: apiKey.id,

      userId: ctx.var.user!.id,
    });

    return ctx.json(DeleteApiKeyResponseSchema.encode(apiKey));
  },
);
