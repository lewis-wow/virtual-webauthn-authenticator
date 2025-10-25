// services/ApiKeyService.ts
import { PrismaClient, type Apikey, type User } from '@repo/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { assert, isString, isTuple } from 'typanion';

export type ApiKeyManagerOptions = {
  prisma: PrismaClient;
};

export class ApiKeyManager {
  static readonly START_LENGHT = 5;

  private readonly prisma: PrismaClient;

  constructor(opts: ApiKeyManagerOptions) {
    this.prisma = opts.prisma;
  }

  /**
   * Generates a new API key.
   * @returns {Object} An object containing the new Apikey record
   * and the fullKey (e.g., "prod_...").
   * The fullKey should be shown to the user ONCE.
   */
  public async generateApiKey(opts: {
    user: Pick<User, 'id'>;
    prefix: string;
    name: string;
    expiresAt?: Date;
    permissions?: string;
  }): Promise<{ apiKey: Apikey; secret: string; fullKey: string }> {
    const { user, prefix, name, expiresAt, permissions } = opts;

    const secret = crypto.randomBytes(32).toString('hex');

    const fullKey = `${prefix}_${secret}`;

    const hashedKey = await bcrypt.hash(secret, 12);

    const apiKey = await this.prisma.apikey.create({
      data: {
        userId: user.id,
        name,
        prefix,
        start: secret.substring(0, ApiKeyManager.START_LENGHT),
        keyHash: hashedKey,
        expiresAt: expiresAt,
        permissions: permissions,
      },
    });

    return { apiKey, secret, fullKey };
  }

  /**
   * Verifies a full API key (e.g., "prod_...").
   * @param fullKey The key provided by the user.
   * @returns The matching Apikey object (with user) if valid, null otherwise.
   */
  public async verifyApiKey(opts: {
    fullKey: string;
    user: Pick<User, 'id'>;
  }): Promise<(Apikey & { user: User }) | null> {
    const { fullKey, user } = opts;

    const parts = fullKey.split('_');
    assert(parts, isTuple([isString(), isString()]));

    const [prefix, providedSecret] = parts;

    const potentialKeys = await this.prisma.apikey.findMany({
      where: {
        prefix: prefix,
        userId: user.id,
        enabled: true,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (potentialKeys.length === 0) {
      return null;
    }

    for (const dbKey of potentialKeys) {
      const isMatch = await bcrypt.compare(providedSecret, dbKey.keyHash);

      if (isMatch) {
        return this.prisma.apikey.findUnique({
          where: { id: dbKey.id },
          include: { user: true },
        });
      }
    }

    return null;
  }

  public async getApiKey(opts: {
    id: string;
    user: Pick<User, 'id'>;
  }): Promise<Apikey | null> {
    const { id, user } = opts;

    return this.prisma.apikey.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });
  }

  public async listApiKeys(opts: {
    user: Pick<User, 'id'>;
  }): Promise<Apikey[]> {
    const { user } = opts;

    return this.prisma.apikey.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  public async expireApiKey(opts: { id: string; user: Pick<User, 'id'> }) {
    return this.updateApiKey({ ...opts, data: { expiresAt: new Date() } });
  }

  public async disableApiKey(opts: { id: string; user: Pick<User, 'id'> }) {
    return this.updateApiKey({ ...opts, data: { enabled: false } });
  }

  public async updateApiKey(opts: {
    id: string;
    user: Pick<User, 'id'>;
    data: {
      name?: string;
      expiresAt?: Date;
      enabled?: boolean;
    };
  }): Promise<Apikey | null> {
    const { id, user, data } = opts;

    const existingKey = await this.prisma.apikey.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingKey) {
      return null;
    }

    return this.prisma.apikey.update({
      where: {
        id,
      },
      data,
    });
  }

  public async deleteExpiredApiKeys(opts: {
    user?: Pick<User, 'id'>;
  }): Promise<{ count: number }> {
    const { user } = opts;

    const where: { expiresAt: { lt: Date }; userId?: string } = {
      expiresAt: {
        lt: new Date(),
      },
    };

    if (user) {
      where.userId = user.id;
    }

    const { count } = await this.prisma.apikey.deleteMany({
      where,
    });

    return { count };
  }
}
