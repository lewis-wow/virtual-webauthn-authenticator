import type { IJwksRepository, Jwk } from '@repo/crypto';
import type { PrismaClient } from '@repo/prisma';

export type PrismaVirtualAuthenticatorJwksRepositoryOptions = {
  prisma: PrismaClient;
};

export class PrismaVirtualAuthenticatorJwksRepository
  implements IJwksRepository
{
  private readonly prisma: PrismaClient;

  constructor(opts: PrismaVirtualAuthenticatorJwksRepositoryOptions) {
    this.prisma = opts.prisma;
  }

  async create(opts: { publicKey: string; privateKey: string }): Promise<Jwk> {
    const { publicKey, privateKey } = opts;

    const jwk = await this.prisma.jwks.create({
      data: {
        publicKey,
        privateKey,
      },
    });

    return jwk;
  }

  async findLatest(): Promise<Jwk | null> {
    const key = await this.prisma.jwks.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    return key[0] ?? null;
  }

  async findAll(): Promise<Jwk[]> {
    const keys = await this.prisma.jwks.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return keys;
  }
}
