import EventEmitter from 'node:events';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TokenFetchFn = (...args: any[]) => Promise<string | null>;

export type TokenFetchOptions<T extends TokenFetchFn> = {
  fetch: T;
};

export class TokenFetch<T extends TokenFetchFn> extends EventEmitter {
  private readonly fetch: T;

  constructor(opts: TokenFetchOptions<T>) {
    super();

    this.fetch = opts.fetch;
  }

  /**
   * Fetches a token from cache or retrieves a new one.
   * @param key - Cache key for the token
   * @param args - Arguments to pass to the fetch function
   * @returns The token string or null if unavailable
   */
  async fetchToken(...args: Parameters<T>): Promise<string | null> {
    try {
      const token = await this.fetch(...args);

      return token;
    } catch (error) {
      this.emit('error', {
        error,
      });

      return null;
    }
  }
}
