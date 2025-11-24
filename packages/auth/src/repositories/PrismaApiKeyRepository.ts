import type { PrismaClient } from '@repo/prisma';

import { ApiKeyNotFound } from '../exceptions';
import type {
  ApiKeyData,
  ApiKeySelect,
  ApiKeyDataArgs,
  IApiKeyRepository,
} from './IApiKeyRepository';

export type PrismaApiKeyRepositoryOptions = {
  prisma: PrismaClient;
};

export class PrismaApiKeyRepository implements IApiKeyRepository {
  private readonly prisma: PrismaClient;

  constructor(opts: PrismaApiKeyRepositoryOptions) {
    this.prisma = opts.prisma;
  }

  async createApiKey(data: ApiKeyDataArgs): Promise<ApiKeyData> {
    const apiKey = await this.prisma.apikey.create({
      data: {
        hashedKey: data.hashedKey,
        userId: data.userId,
        expiresAt: data.expiresAt,
        lookupKey: data.lookupKey,
        name: data.name,
        start: data.start,
        prefix: data.prefix,
        permissions: data.permissions ?? undefined,
      },
    });

    return apiKey as ApiKeyData;
  }

  async updateApiKey(
    opts: { userId: string; id: string },
    data: Partial<ApiKeyDataArgs>,
  ): Promise<ApiKeyData> {
    const { userId, id } = opts;
    console.log(data);

    const apiKey = await this.prisma.apikey.update({
      where: {
        userId,
        id,
      },
      data: {},
    });

    return apiKey as ApiKeyData;
  }

  async findByLookupKey(opts: { lookupKey: string }): Promise<ApiKeyData> {
    const { lookupKey } = opts;

    const apiKey = await this.prisma.apikey.findUnique({
      where: { lookupKey },
    });

    if (apiKey === null) {
      throw new ApiKeyNotFound();
    }

    return apiKey as ApiKeyData;
  }

  async findById(opts: {
    id: string;
    select?: ApiKeySelect;
  }): Promise<Partial<ApiKeyData>> {
    const { id, select } = opts;

    const apiKey = await this.prisma.apikey.findUnique({
      where: { id },
      select,
    });

    if (apiKey === null) {
      throw new ApiKeyNotFound();
    }

    return apiKey as Partial<ApiKeyData>;
  }

  async listApiKeys(opts: {
    userId: string;
    select?: ApiKeySelect;
  }): Promise<Partial<ApiKeyData>[]> {
    const { userId, select } = opts;

    const apiKeys = await this.prisma.apikey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select,
    });

    return apiKeys as Partial<ApiKeyData>[];
  }

  async useApiKey(opts: { userId: string; id: string }): Promise<ApiKeyData> {
    const { userId, id } = opts;

    const apiKey = await this.prisma.apikey.update({
      where: { userId, id },
      data: { lastUsedAt: new Date() },
    });

    return apiKey as ApiKeyData;
  }

  async revokeApiKey(opts: {
    userId: string;
    id: string;
  }): Promise<ApiKeyData> {
    const { userId, id } = opts;

    const apiKey = await this.prisma.apikey.update({
      where: { userId, id },
      data: { revokedAt: new Date() },
    });

    return apiKey as ApiKeyData;
  }

  async deleteApiKey(opts: {
    userId: string;
    id: string;
  }): Promise<ApiKeyData> {
    const { userId, id } = opts;

    const apiKey = await this.prisma.apikey.delete({
      where: { userId, id },
    });

    return apiKey as ApiKeyData;
  }
}
