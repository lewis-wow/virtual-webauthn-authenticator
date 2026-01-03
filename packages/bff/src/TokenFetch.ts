import { decodeJwt } from 'jose';
import type { LRUCache } from 'lru-cache';
import EventEmitter from 'node:events';

// Default TTL for tokens without expiration claim (1 hour in milliseconds)
const DEFAULT_TOKEN_TTL_MS = 3600000;
// Conversion factor from seconds to milliseconds
const SECONDS_TO_MILLISECONDS = 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TokenFetchFn = (...args: any[]) => Promise<string | null>;

export type TokenFetchOptions<T extends TokenFetchFn> = {
  cache: LRUCache<string, string>;
  fetch: T;
};

export class TokenFetch<T extends TokenFetchFn> extends EventEmitter {
  private readonly cache: LRUCache<string, string>;
  private readonly fetch: T;

  constructor(opts: TokenFetchOptions<T>) {
    super();

    this.cache = opts.cache;
    this.fetch = opts.fetch;
  }

  /**
   * Fetches a token from cache or retrieves a new one.
   * @param key - Cache key for the token
   * @param args - Arguments to pass to the fetch function
   * @returns The token string or null if unavailable
   */
  async fetchToken(
    key: string,
    ...args: Parameters<T>
  ): Promise<string | null> {
    const cachedToken = this.cache.get(key);

    if (cachedToken !== undefined) {
      return cachedToken;
    }

    try {
      const token = await this.fetch(...args);

      if (token === null) {
        return null;
      }

      const claims = decodeJwt(token);

      // exp is in seconds since epoch, calculate TTL in milliseconds
      const currentTimeInSeconds = Math.floor(
        Date.now() / SECONDS_TO_MILLISECONDS,
      );
      const ttl = claims.exp
        ? (claims.exp - currentTimeInSeconds) * SECONDS_TO_MILLISECONDS
        : DEFAULT_TOKEN_TTL_MS;

      // Cache the token
      this.cache.set(key, token, {
        ttl,
      });

      return token;
    } catch (error) {
      this.emit('error', {
        error,
      });

      return null;
    }
  }
}
