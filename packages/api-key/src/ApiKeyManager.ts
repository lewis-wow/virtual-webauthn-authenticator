import { Permission } from '@repo/jwt/enums';
import { Logger } from '@repo/logger';
import { Pagination } from '@repo/pagination';
import type { PaginationResult } from '@repo/pagination/validation';
import { Prisma, type PrismaClient } from '@repo/prisma';
import { toBase64Url } from '@repo/utils';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'node:crypto';

import { API_KEY_CONFIG } from './constants';
import { ApiKeyDeleteEnabledFailed } from './exceptions/ApiKeyDeleteEnabledFailed';
import { ApiKeyDeleteFailed } from './exceptions/ApiKeyDeleteFailed';
import { ApiKeyNotFound } from './exceptions/ApiKeyNotFound';
import { ApiKeyRevokeFailed } from './exceptions/ApiKeyRevokeFailed';
import type { ApiKey } from './validation/ApiKeySchema';

const LOG_PREFIX = 'API_KEY';
const log = new Logger({
  prefix: LOG_PREFIX,
});

// We select the fields that are safe to return publicly (e.g., to a dashboard)
export const PUBLIC_API_KEY_SELECT = {
  id: true,
  name: true,
  prefix: true,
  lookupKey: true, // Show the 'sk_...' part
  userId: true,
  expiresAt: true,
  revokedAt: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true,
  permissions: true,
  enabled: true,
  start: true,
} satisfies Prisma.ApiKeySelect;

export type ApiKeyManagerOptions = {
  prisma: PrismaClient;
};

export class ApiKeyManager {
  private readonly prisma: PrismaClient;

  constructor(opts: ApiKeyManagerOptions) {
    this.prisma = opts.prisma;
  }

  private _generateRandomString(length: number): string {
    return toBase64Url(randomBytes(length));
  }

  /**
   * Safely parses a provided key string into lookupKey and secret
   * based on fixed byte length, ignoring delimiter ambiguity.
   */
  private _parseKey(
    providedKey: string,
  ): { lookupKey: string; secret: string } | null {
    // Calculate expected char length of the secret in base64url
    // Formula: ceil((bytes * 8) / 6)
    // For 32 bytes, this is 43 characters.
    const secretCharLength = Math.ceil(
      (API_KEY_CONFIG.SECRET_BYTE_LENGTH * 8) / 6,
    );

    // Key must be longer than just the secret part + separator
    if (providedKey.length <= secretCharLength) {
      return null;
    }

    // Extract the secret from the END of the string
    const secret = providedKey.slice(-secretCharLength);

    // The remainder is the lookupKey + separator
    const remainder = providedKey.slice(0, -secretCharLength);

    // Validate that the separator exists exactly where we expect it
    if (!remainder.endsWith('_')) {
      return null;
    }

    // Extract lookup key by removing the trailing separator
    const lookupKey = remainder.slice(0, -1);

    return { lookupKey, secret };
  }

  async generate(opts: {
    userId: string;
    name?: string | null;
    expiresAt?: Date | null;
    permissions?: Permission[] | null;
  }): Promise<{ plaintextKey: string; apiKey: ApiKey }> {
    const { userId, name, expiresAt, permissions: _ } = opts;

    const internalLookupKey = this._generateRandomString(
      API_KEY_CONFIG.LOOKUP_BYTE_LENGTH,
    );
    const start = internalLookupKey.substring(
      0,
      API_KEY_CONFIG.SECRET_START_LENGTH,
    );

    const lookupKey = `${API_KEY_CONFIG.KEY_PREFIX}${internalLookupKey}`;

    const secret = this._generateRandomString(
      API_KEY_CONFIG.SECRET_BYTE_LENGTH,
    );

    const plaintextKey = `${lookupKey}_${secret}`;

    const hashedKey = await hash(secret, API_KEY_CONFIG.BCRYPT_ROUNDS);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        hashedKey,
        userId,
        expiresAt,
        lookupKey,
        name,
        start,
        prefix: API_KEY_CONFIG.KEY_PREFIX,
        permissions: [
          Permission['CREDENTIAL.CREATE'],
          Permission['CREDENTIAL.GET'],
        ],
      },
    });

    log.info('New API key generated', {
      userId: apiKey.userId,
      keyId: apiKey.id,
    });

    return {
      plaintextKey,
      apiKey: {
        ...apiKey,
        metadata: { createdWebAuthnPublicKeyCredentialCount: 0 },
      } as ApiKey,
    };
  }

  async verify(providedKey: string): Promise<ApiKey | null> {
    const parsed = this._parseKey(providedKey);

    if (!parsed) {
      log.warn('Invalid key format provided. Length or separator mismatch.');
      return null;
    }

    const { lookupKey, secret } = parsed;

    // O(1) Lookup
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { lookupKey },
      include: {
        _count: {
          select: {
            webAuthnPublicKeyCredentials: true,
          },
        },
      },
    });

    if (!apiKey) {
      log.warn('API key not found', { lookupKey });
      return null;
    }

    if (apiKey.revokedAt) {
      log.warn('API key has been revoked', { keyId: apiKey.id });
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      log.warn('API key has expired', { keyId: apiKey.id });
      return null;
    }

    const isValid = await compare(secret, apiKey.hashedKey);

    if (!isValid) {
      log.warn('Invalid secret provided for key', { keyId: apiKey.id });
      return null;
    }

    // Update last used time.
    void this.prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((err) => {
        log.error('Failed to update lastUsedAt', {
          keyId: apiKey.id,
          error: err,
        });
      });

    log.info('API key validated', { keyId: apiKey.id });

    return {
      ...apiKey,
      metadata: {
        createdWebAuthnPublicKeyCredentialCount:
          apiKey._count.webAuthnPublicKeyCredentials,
      },
    } as ApiKey;
  }

  async revoke(opts: { userId: string; id: string }): Promise<ApiKey> {
    const { userId, id } = opts;

    try {
      const apiKey = await this.prisma.apiKey.update({
        where: { userId, id },
        data: { revokedAt: new Date() },
        include: {
          _count: {
            select: {
              webAuthnPublicKeyCredentials: true,
            },
          },
        },
      });

      log.info('API key revoked', { keyId: id });
      return {
        ...apiKey,
        metadata: {
          createdWebAuthnPublicKeyCredentialCount:
            apiKey._count.webAuthnPublicKeyCredentials,
        },
      } as ApiKey;
    } catch {
      throw new ApiKeyRevokeFailed();
    }
  }

  async update(opts: {
    userId: string;
    id: string;
    data: Partial<Pick<ApiKey, 'enabled' | 'name' | 'expiresAt' | 'revokedAt'>>;
  }): Promise<ApiKey> {
    const { userId, id, data } = opts;

    const apiKey = await this.prisma.apiKey.update({
      where: { userId, id },
      data: {
        enabled: data.enabled,
        name: data.name,
        expiresAt: data.expiresAt,
        revokedAt: data.revokedAt,
      },
      include: {
        _count: {
          select: {
            webAuthnPublicKeyCredentials: true,
          },
        },
      },
    });

    return {
      ...apiKey,
      metadata: {
        createdWebAuthnPublicKeyCredentialCount:
          apiKey._count.webAuthnPublicKeyCredentials,
      },
    } as ApiKey;
  }

  async delete(opts: { userId: string; id: string }): Promise<ApiKey> {
    const { userId, id } = opts;

    const apiKey = await this.prisma.apiKey
      .delete({
        where: { userId, id },
        include: {
          _count: {
            select: {
              webAuthnPublicKeyCredentials: true,
            },
          },
        },
      })
      .catch(() => {
        throw new ApiKeyDeleteFailed();
      });

    if (apiKey.enabled) {
      throw new ApiKeyDeleteEnabledFailed();
    }

    log.info('API key deleted', { keyId: id });
    return {
      ...apiKey,
      metadata: {
        createdWebAuthnPublicKeyCredentialCount:
          apiKey._count.webAuthnPublicKeyCredentials,
      },
    } as ApiKey;
  }

  async get(opts: { userId: string; id: string }): Promise<ApiKey> {
    const { userId, id } = opts;

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { userId, id },
      select: {
        ...PUBLIC_API_KEY_SELECT,
        _count: {
          select: {
            webAuthnPublicKeyCredentials: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new ApiKeyNotFound();
    }

    return {
      ...apiKey,
      metadata: {
        createdWebAuthnPublicKeyCredentialCount:
          apiKey._count.webAuthnPublicKeyCredentials,
      },
    } as ApiKey;
  }

  async list(opts: {
    userId: string;
    limit?: number;
    cursor?: string;
  }): Promise<PaginationResult<ApiKey>> {
    const { userId, limit, cursor } = opts;

    const pagination = new Pagination(async ({ pagination }) => {
      const apiKeys = await this.prisma.apiKey.findMany({
        where: { userId },
        select: {
          ...PUBLIC_API_KEY_SELECT,
          _count: {
            select: {
              webAuthnPublicKeyCredentials: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...pagination,
      });

      return apiKeys.map((apiKey) => ({
        ...apiKey,
        metadata: {
          createdWebAuthnPublicKeyCredentialCount:
            apiKey._count.webAuthnPublicKeyCredentials,
        },
      })) as ApiKey[];
    });

    const result = await pagination.fetch({ limit, cursor });

    return result;
  }
}
