import { Logger } from '@repo/logger';
import { Prisma, type PrismaClient } from '@repo/prisma';
import { ApiKeySchema, type ApiKey } from '@repo/validation';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import z from 'zod';

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
  metadata: true,
  permissions: true,
  enabled: true,
} satisfies Prisma.ApikeySelect;

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
   * Generates a new API key.
   * This is the only time the plaintext key is available.
   *
   * @returns The plaintext key (e.g., 'sk_live_..._...') and the DB record.
   */
  async generate(opts: {
    userId: string;
    name?: string;
    expiresAt?: Date;
    permissions?: Record<string, string[]>;
    metadata?: Record<string, unknown>;
  }): Promise<{ plaintextKey: string; apiKey: ApiKey }> {
    const { userId, name, expiresAt, permissions, metadata } = opts;

    const lookupKey =
      ApiKeyManager.KEY_PREFIX +
      this._generateRandomString(this.LOOKUP_BYTE_LENGTH);

    const secret = this._generateRandomString(this.SECRET_BYTE_LENGTH);

    // This is the key you show to the user ONE TIME.
    const plaintextKey = `${lookupKey}_${secret}`;

    // This is what you store in the database.
    const hashedKey = await hash(secret, this.BCRYPT_ROUNDS);

    const apiKey = await this.prisma.apikey.create({
      data: {
        hashedKey,
        userId,
        expiresAt,
        lookupKey,
        name,
        prefix: ApiKeyManager.KEY_PREFIX,
        permissions: permissions ? JSON.stringify(permissions) : undefined,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    log.info('New API key generated', {
      userId: apiKey.userId,
      keyId: apiKey.id,
    });

    return { plaintextKey, apiKey: ApiKeySchema.decode(apiKey) };
  }

  /**
   * Validates a provided plaintext API key.
   * This is the O(1) lookup and secure comparison.
   *
   * @param providedKey The full plaintext key from the user.
   * @returns The ApiKey record if valid, otherwise null.
   */
  async verify(providedKey: string): Promise<ApiKey | null> {
    // Find the last underscore, which separates the lookupKey from the secret
    const lastUnderscoreIndex = providedKey.lastIndexOf('_');

    // Check for invalid format (no underscore, or key starts/ends with it)
    if (
      lastUnderscoreIndex <= 0 ||
      lastUnderscoreIndex === providedKey.length - 1
    ) {
      log.warn('Invalid key format provided. No delimiter found.');
      return null;
    }

    // Split the key into its two parts
    const lookupKey = providedKey.substring(0, lastUnderscoreIndex);
    const secret = providedKey.substring(lastUnderscoreIndex + 1);

    if (!secret) {
      // This should be caught by the index check, but good for safety
      log.warn('Invalid key format provided, no secret part found.', {
        lookupKey,
      });

      return null;
    }

    // O(1) Lookup
    const apiKey = await this.prisma.apikey.findUnique({
      where: { lookupKey },
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

    // 4. Update last used time.
    // We do this after returning, so we don't slow down the request.
    this.prisma.apikey
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

    return ApiKeySchema.decode(apiKey);
  }

  /**
   * Revokes a key by its 'id' (cuid).
   * This is a soft-delete.
   */
  async revoke(opts: { id: string }): Promise<ApiKey | null> {
    const { id } = opts;

    try {
      const apiKey = await this.prisma.apikey.update({
        where: { id },
        data: { revokedAt: new Date() },
      });

      log.info('API key revoked', { keyId: id });
      return ApiKeySchema.decode(apiKey);
    } catch (error) {
      log.error('Failed to revoke key', { keyId: id, error });
      return null;
    }
  }

  /**
   * Deletes a key by its 'id' (cuid).
   * This is a hard-delete. Use with caution.
   */
  async delete(opts: { id: string }): Promise<ApiKey | null> {
    const { id } = opts;

    try {
      const apiKey = await this.prisma.apikey.delete({
        where: { id },
      });

      log.info('API key deleted', { keyId: id });
      return ApiKeySchema.decode(apiKey);
    } catch (error) {
      log.error('Failed to delete key', { keyId: id, error });
      return null;
    }
  }

  /**
   * Gets the public-safe details of a single key.
   */
  async get(opts: { id: string }): Promise<ApiKey | null> {
    const { id } = opts;

    const apiKey = await this.prisma.apikey.findUnique({
      where: { id },
      select: PUBLIC_API_KEY_SELECT,
    });

    return apiKey ? ApiKeySchema.decode(apiKey) : null;
  }

  /**
   * Lists all public-safe key details for a user.
   */
  async list(opts: { userId: string }): Promise<ApiKey[]> {
    const { userId } = opts;

    const apiKeys = await this.prisma.apikey.findMany({
      where: { userId },
      select: PUBLIC_API_KEY_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return z.array(ApiKeySchema).decode(apiKeys);
  }
}
