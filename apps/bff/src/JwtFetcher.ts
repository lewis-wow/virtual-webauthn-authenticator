import type { LRUCache } from 'lru-cache';
import EventEmitter from 'node:events';

export type JwtFetcherConfig = {
  authEndpoint: string;
};

export type JwtFetcherOptions = {
  cache: LRUCache<string, string>;
  config: JwtFetcherConfig;
};

export class JwtFetcher extends EventEmitter {
  private readonly cache: LRUCache<string, string>;
  private readonly config: JwtFetcherConfig;

  constructor(opts: JwtFetcherOptions) {
    super();

    this.cache = opts.cache;
    this.config = opts.config;
  }

  async fetchJwtToken(apiKey: string) {
    const cachedToken = this.cache.get(apiKey);

    if (cachedToken !== undefined) {
      return cachedToken;
    }

    try {
      const response = await fetch(this.config.authEndpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        this.emit('responseFailed', {
          status: response.status,
          statusText: response.statusText,
        });

        return null;
      }

      const { token } = (await response.json()) as { token: string };

      // Cache the token
      this.cache.set(apiKey, token);

      return token;
    } catch (error) {
      this.emit('error', {
        error,
      });

      return null;
    }
  }
}
