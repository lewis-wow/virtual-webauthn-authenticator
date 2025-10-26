import { ApiKeyManager } from '@repo/api-key';
import { Unauthorized } from '@repo/exception';
import {
  type Apikey,
  type InternalApiKey,
  type PrismaClient,
} from '@repo/prisma';
import type { MaybePromise } from '@repo/types';
import { Hono } from 'hono';
import 'hono/cookie';
import { getCookie } from 'hono/cookie';
import { proxy } from 'hono/proxy';
import { assert, isString } from 'typanion';

export type AuthProxyOptions = {
  apiKeyManager: ApiKeyManager;
  prisma: PrismaClient;
  originServerBaseURL: string;
  authorization?: (opts: {
    request: Request;
    cookie: (name: string) => string | undefined;
  }) => MaybePromise<string | undefined>;
  rewritePath?: (path: string | undefined) => string | undefined;
};

export class AuthProxy {
  private readonly apiKeyManager: ApiKeyManager;
  private readonly prisma: PrismaClient;

  private readonly app = new Hono();

  constructor(opts: AuthProxyOptions) {
    this.apiKeyManager = opts.apiKeyManager;
    this.prisma = opts.prisma;

    const { originServerBaseURL, authorization, rewritePath } = opts;

    assert(originServerBaseURL, isString());

    this.app.all('*', async (ctx) => {
      const path = this._trimSlashes(
        rewritePath ? rewritePath(ctx.req.path) : ctx.req.path,
      );

      const userId = await authorization?.({
        request: ctx.req.raw,
        cookie: (key: string) => getCookie(ctx, key),
      });

      if (!userId) {
        throw new Unauthorized('User is not authorized.');
      }

      const { internalApiKey, apiKey } =
        await this._lazyInitializeInternalApiKey(userId);
      const internalApiKeySecret =
        this.apiKeyManager.decryptInternalApiKeySecret(internalApiKey);

      const fullApiKey = ApiKeyManager.getFullApiKey({
        prefix: apiKey.prefix,
        secret: internalApiKeySecret,
      });

      const headers = new Headers({
        authorization: `Bearer ${fullApiKey}`,
      });

      const response = await proxy(`${originServerBaseURL}/${path}`, {
        headers,
      });

      return response;
    });
  }

  /**
   * Trims any leading or trailing slashes from a given string.
   *
   * @param path - The string, typically a URL pathname.
   * @returns The string with leading/trailing slashes removed.
   */
  private _trimSlashes(path: string | undefined): string | undefined {
    // This regex looks for:
    // ^\/  - A slash at the beginning of the string
    // |    - OR
    // \/$  - A slash at the end of the string
    //
    // The 'g' (global) flag ensures it replaces both if they exist.
    return path?.replace(/^\/|\/$/g, '');
  }

  private async _lazyInitializeInternalApiKey(
    userId: string,
  ): Promise<{ internalApiKey: InternalApiKey; apiKey: Apikey }> {
    const internalApiKeyResult = await this.prisma.internalApiKey.findFirst({
      where: {
        apiKey: {
          userId: userId,
        },
      },
      include: {
        apiKey: true,
      },
    });

    if (internalApiKeyResult) {
      const { apiKey, ...internalApiKey } = internalApiKeyResult;
      return { apiKey, internalApiKey };
    }

    const { internalApiKey, apiKey } =
      await this.apiKeyManager.generateInternalApiKey({
        user: {
          id: userId,
        },
      });

    return { internalApiKey, apiKey };
  }

  getApp() {
    return this.app;
  }
}
