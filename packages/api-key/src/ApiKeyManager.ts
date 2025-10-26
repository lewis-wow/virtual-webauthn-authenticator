import { Encryption, Hash } from '@repo/crypto';
import {
  ApiKeyType,
  PrismaClient,
  type Apikey,
  type InternalApiKey,
  type User,
} from '@repo/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { assert, isString, isTuple } from 'typanion';

export type ApiKeyManagerOptions = {
  prisma: PrismaClient;
  encryptionKey: string;
};

export class ApiKeyManager {
  static readonly START_LENGHT = 5;

  private readonly prisma: PrismaClient;
  private readonly encryptionKey: string;

  constructor(opts: ApiKeyManagerOptions) {
    this.prisma = opts.prisma;
    this.encryptionKey = opts.encryptionKey;
  }

  public static isApiKey(value: unknown): value is string {
    if (typeof value !== 'string') {
      return false;
    }

    const parts = value.split('_');

    if (!isTuple([isString(), isString()])(parts)) {
      return false;
    }

    if (parts[0].length === 0 || parts[1].length === 0) {
      return false;
    }

    return true;
  }

  private async _generateApiKey(opts: {
    user: Pick<User, 'id'>;
    prefix: string;
    name: string;
    type: ApiKeyType;
    expiresAt?: Date;
    permissions?: string;
  }): Promise<{ apiKey: Apikey; secret: string }> {
    const { user, prefix, name, expiresAt, permissions, type } = opts;

    const secret = crypto.randomBytes(32).toString('hex');

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
        type: type ?? ApiKeyType.EXTERNAL_API_KEY,
      },
    });

    return { apiKey, secret };
  }

  public static getFullApiKey(opts: {
    prefix: string;
    secret: string;
  }): string {
    const { prefix, secret } = opts;

    return `${prefix}_${secret}`;
  }

  public async generateExternalApiKey(opts: {
    user: Pick<User, 'id'>;
    prefix: string;
    name: string;
    expiresAt?: Date;
    permissions?: string;
  }) {
    return await this._generateApiKey({
      ...opts,
      type: ApiKeyType.EXTERNAL_API_KEY,
    });
  }

  public async generateInternalApiKey(opts: {
    user: Pick<User, 'id'>;
  }): Promise<{
    apiKey: Apikey;
    internalApiKey: InternalApiKey;
    secret: string;
  }> {
    const { user } = opts;

    const { apiKey, secret } = await this._generateApiKey({
      user,
      type: ApiKeyType.INTERNAL_API_KEY,
      prefix: 'internal',
      name: 'Internal API key',
    });

    const encryptedKeySecret = Encryption.encrypt({
      key: Hash.sha256(Buffer.from(this.encryptionKey)),
      plainText: secret,
    });

    const internalApiKey = await this.prisma.internalApiKey.create({
      data: {
        apikeyId: apiKey.id,
        encryptedKeySecret,
      },
    });

    return { apiKey, internalApiKey, secret };
  }

  public decryptInternalApiKeySecret(
    internalApiKey: Pick<InternalApiKey, 'encryptedKeySecret'>,
  ) {
    return Encryption.decrypt({
      key: Hash.sha256(Buffer.from(this.encryptionKey)),
      encryptedText: internalApiKey.encryptedKeySecret,
    });
  }

  /**
   * Verifies a full API key (e.g., "prod_...").
   * @param fullKey The key provided by the user.
   * @returns The matching Apikey object (with user) if valid, null otherwise.
   */
  public async verifyApiKey(opts: {
    fullApiKey: string;
  }): Promise<(Apikey & { user: User }) | null> {
    const { fullApiKey } = opts;

    const parts = fullApiKey.split('_');
    assert(parts, isTuple([isString(), isString()]));

    const [prefix, providedSecret] = parts;

    const potentialKeys = await this.prisma.apikey.findMany({
      where: {
        prefix: prefix,
        enabled: true,
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            expiresAt: null,
          },
        ],
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

  public async getApiKeyOrThrow(opts: {
    id: string;
    user: Pick<User, 'id'>;
  }): Promise<Apikey> {
    const { id, user } = opts;

    return this.prisma.apikey.findUniqueOrThrow({
      where: {
        id,
        userId: user.id,
      },
    });
  }

  public async getApiKey(opts: {
    id: string;
    user: Pick<User, 'id'>;
  }): Promise<Apikey | null> {
    try {
      return await this.getApiKeyOrThrow(opts);
    } catch {
      return null;
    }
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
    return this.updateApiKeyOrThrow({
      ...opts,
      data: { expiresAt: new Date() },
    });
  }

  public async disableApiKey(opts: { id: string; user: Pick<User, 'id'> }) {
    return this.updateApiKeyOrThrow({ ...opts, data: { enabled: false } });
  }

  public async updateApiKeyOrThrow(opts: {
    id: string;
    user: Pick<User, 'id'>;
    data: {
      name?: string;
      expiresAt?: Date;
      enabled?: boolean;
    };
  }): Promise<Apikey> {
    const { id, user, data } = opts;

    return this.prisma.apikey.update({
      where: {
        id,
        userId: user.id,
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
