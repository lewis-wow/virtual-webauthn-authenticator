import { decodeJwt } from 'jose';
import type { LRUCache } from 'lru-cache';
import EventEmitter from 'node:events';

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

  async fetchToken(key: string, ...args: Parameters<T>) {
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
      const ttl = claims.exp
        ? (claims.exp - Math.floor(Date.now() / 1000)) * 1000
        : 3600000; // fallback to 1 hour if no exp claim

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
