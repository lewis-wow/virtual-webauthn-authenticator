import type { IJwksRepository, Jwk } from '@repo/crypto';
import type { PrismaClient } from '@repo/prisma';

export type PrismaAuthJwksRepositoryOptions = {
  prisma: PrismaClient;
};

export class PrismaAuthJwksRepository implements IJwksRepository {
  static readonly DATABASE_LABEL = 'auth';
  private readonly prisma: PrismaClient;

  constructor(opts: PrismaAuthJwksRepositoryOptions) {
    this.prisma = opts.prisma;
  }

  async create(opts: { publicKey: string; privateKey: string }): Promise<Jwk> {
    const { publicKey, privateKey } = opts;

    const jwk = await this.prisma.jwks.create({
      data: {
        publicKey,
        privateKey,
        label: PrismaAuthJwksRepository.DATABASE_LABEL,
      },
    });

    return jwk;
  }

  async findLatest(): Promise<Jwk | null> {
    const key = await this.prisma.jwks.findMany({
      where: {
        label: PrismaAuthJwksRepository.DATABASE_LABEL,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    return key[0] ?? null;
  }

  async findAll(): Promise<Jwk[]> {
    const keys = await this.prisma.jwks.findMany({
      where: {
        label: PrismaAuthJwksRepository.DATABASE_LABEL,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return keys;
  }
}
