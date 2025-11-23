import type { Apikey, PrismaClient, User } from '@repo/prisma';
import { assert, isString } from 'typanion';

export type Profile = User & {
  apiKey: Apikey | null;
};

export type ProfileManagerOptions = {
  prisma: PrismaClient;
};

export class ProfileManager {
  private readonly prisma: PrismaClient;

  constructor(opts: ProfileManagerOptions) {
    this.prisma = opts.prisma;
  }

  async getProfile(opts: {
    userId: string;
    apiKeyId?: string;
  }): Promise<Profile> {
    const { userId, apiKeyId } = opts;

    assert(userId, isString());

    const { apiKeys, ...user } = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        apiKeys: {
          take: 1,
          where: {
            id: apiKeyId,
          },
        },
      },
    });

    return {
      ...user,
      apiKey: apiKeys[0] ?? null,
    };
  }
}
