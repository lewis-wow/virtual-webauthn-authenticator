import type { PrismaClient } from '@repo/prisma';

import type {
  IJwksRepository,
  Jwk,
  JwksRepositoryCreateOptions,
  JwksRepositoryFindAllOptions,
  JwksRepositoryFindLatestOptions,
} from './IJwksRepository';

export type PrismaAuthJwksRepositoryOptions = {
  prisma: PrismaClient;
};

export class PrismaAuthJwksRepository implements IJwksRepository {
  private readonly prisma: PrismaClient;

  constructor(opts: PrismaAuthJwksRepositoryOptions) {
    this.prisma = opts.prisma;
  }

  async create(opts: JwksRepositoryCreateOptions): Promise<Jwk> {
    const { publicKey, privateKey, label } = opts;

    const jwk = await this.prisma.jwks.create({
      data: {
        publicKey,
        privateKey,
        label,
      },
    });

    return jwk;
  }

  async findLatest(
    opts?: JwksRepositoryFindLatestOptions,
  ): Promise<Jwk | null> {
    const { label } = opts ?? {};

    const key = await this.prisma.jwks.findMany({
      where: {
        label,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    return key[0] ?? null;
  }

  async findAll(opts?: JwksRepositoryFindAllOptions): Promise<Jwk[]> {
    const { label } = opts ?? {};

    const keys = await this.prisma.jwks.findMany({
      where: {
        label,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return keys;
  }
}
