import { Logger } from '@repo/logger';
import { Prisma, type PrismaClient } from '@repo/prisma';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';

import { Permission } from './enums/Permission';
import { ApiKeyDeleteEnabledFailed } from './exceptions/ApiKeyDeleteEnabledFailed';
import { ApiKeyDeleteFailed } from './exceptions/ApiKeyDeleteFailed';
import { ApiKeyNotFound } from './exceptions/ApiKeyNotFound';
import { ApiKeyRevokeFailed } from './exceptions/ApiKeyRevokeFailed';
import type { ApiKey } from './zod-validation/ApiKeySchema';

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
  /**
   * Hashing cost.
   */
  private readonly BCRYPT_ROUNDS = 12;
  /**
   * Byte length for the 'secret' part. 32 bytes = 44 base64url chars.
   */
  private readonly SECRET_BYTE_LENGTH = 32;
  /**
   * Byte length for the 'lookupKey' part. 16 bytes = 22 base64url chars.
   */
  private readonly LOOKUP_BYTE_LENGTH = 16;

  private readonly SECRET_START_LENGTH = 8;
  /**
   * Prefix for all live keys.
   */
  static readonly KEY_PREFIX = 'sk_live_';

  constructor(opts: ApiKeyManagerOptions) {
    this.prisma = opts.prisma;
  }

  /**
   * Generates a new, secure random string.
   * @param length Number of random bytes to generate.
   * @returns A base64url-encoded string.
   */
  private _generateRandomString(length: number): string {
    return randomBytes(length).toString('base64url');
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
    const secretCharLength = Math.ceil((this.SECRET_BYTE_LENGTH * 8) / 6);

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

  /**
   * Generates a new API key.
   * This is the only time the plaintext key is available.
   *
   * @returns The plaintext key (e.g., 'sk_live_..._...') and the DB record.
   */
  async generate(opts: {
    userId: string;
    name?: string | null;
    expiresAt?: Date | null;
    permissions?: Permission[] | null;
  }): Promise<{ plaintextKey: string; apiKey: ApiKey }> {
    const { userId, name, expiresAt, permissions: _ } = opts;

    const internalLookupKey = this._generateRandomString(
      this.LOOKUP_BYTE_LENGTH,
    );
    const start = internalLookupKey.substring(0, this.SECRET_START_LENGTH);

    const lookupKey = `${ApiKeyManager.KEY_PREFIX}${internalLookupKey}`;

    const secret = this._generateRandomString(this.SECRET_BYTE_LENGTH);

    // This is the key you show to the user ONE TIME.
    const plaintextKey = `${lookupKey}_${secret}`;

    // This is what you store in the database.
    const hashedKey = await hash(secret, this.BCRYPT_ROUNDS);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        hashedKey,
        userId,
        expiresAt,
        lookupKey,
        name,
        start,
        prefix: ApiKeyManager.KEY_PREFIX,
        permissions: [
          Permission['Credential.create'],
          Permission['Credential.get'],
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
        metadata: { createdWebAuthnCredentialCount: 0 },
      } as ApiKey,
    };
  }

  /**
   * Validates a provided plaintext API key.
   * This is the O(1) lookup and secure comparison.
   *
   * @param providedKey The full plaintext key from the user.
   * @returns The ApiKey record if valid, otherwise null.
   */
  async verify(providedKey: string): Promise<ApiKey | null> {
    // Use fixed-length parsing to handle secrets containing underscores
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
            webAuthnCredentials: true,
          },
        },
      },
    });

    if (!apiKey) {
      log.warn('API key not found', { lookupKey });
      return null;
    }

    // Check for revocation or expiration
    if (apiKey.revokedAt) {
      log.warn('API key has been revoked', { keyId: apiKey.id });
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      log.warn('API key has expired', { keyId: apiKey.id });
      return null;
    }

    // Secure Hash Comparison
    const isValid = await compare(secret, apiKey.hashedKey);

    if (!isValid) {
      log.warn('Invalid secret provided for key', { keyId: apiKey.id });
      return null;
    }

    // Update last used time.
    // We do this after returning, so we don't slow down the request.
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
        createdWebAuthnCredentialCount: apiKey._count.webAuthnCredentials,
      },
    } as ApiKey;
  }

  /**
   * Revokes a key by its 'id' (cuid).
   * This is a soft-delete.
   */
  async revoke(opts: { userId: string; id: string }): Promise<ApiKey> {
    const { userId, id } = opts;

    try {
      const apiKey = await this.prisma.apiKey.update({
        where: { userId, id },
        data: { revokedAt: new Date() },
        include: {
          _count: {
            select: {
              webAuthnCredentials: true,
            },
          },
        },
      });

      log.info('API key revoked', { keyId: id });
      return {
        ...apiKey,
        metadata: {
          createdWebAuthnCredentialCount: apiKey._count.webAuthnCredentials,
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
            webAuthnCredentials: true,
          },
        },
      },
    });

    return {
      ...apiKey,
      metadata: {
        createdWebAuthnCredentialCount: apiKey._count.webAuthnCredentials,
      },
    } as ApiKey;
  }

  /**
   * Deletes a key by its 'id' (cuid).
   * This is a hard-delete. Use with caution.
   */
  async delete(opts: { userId: string; id: string }): Promise<ApiKey> {
    const { userId, id } = opts;

    const apiKey = await this.prisma.apiKey
      .delete({
        where: { userId, id },
        include: {
          _count: {
            select: {
              webAuthnCredentials: true,
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
        createdWebAuthnCredentialCount: apiKey._count.webAuthnCredentials,
      },
    } as ApiKey;
  }

  /**
   * Gets the public-safe details of a single key.
   */
  async get(opts: { userId: string; id: string }): Promise<ApiKey> {
    const { userId, id } = opts;

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { userId, id },
      select: {
        ...PUBLIC_API_KEY_SELECT,
        _count: {
          select: {
            webAuthnCredentials: true,
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
        createdWebAuthnCredentialCount: apiKey._count.webAuthnCredentials,
      },
    } as ApiKey;
  }

  /**
   * Lists all public-safe key details for a user.
   */
  async list(opts: { userId: string }): Promise<ApiKey[]> {
    const { userId } = opts;

    const apiKeys = await this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        ...PUBLIC_API_KEY_SELECT,
        _count: {
          select: {
            webAuthnCredentials: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys.map((apiKey) => ({
      ...apiKey,
      metadata: {
        createdWebAuthnCredentialCount: apiKey._count.webAuthnCredentials,
      },
    })) as ApiKey[];
  }
}
