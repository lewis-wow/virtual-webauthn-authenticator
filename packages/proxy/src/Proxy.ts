import { defaultLog } from '@repo/logger';
import type { MaybePromise } from '@repo/types';
import { Hono } from 'hono';
import 'hono/cookie';
import { getCookie } from 'hono/cookie';
import { proxy } from 'hono/proxy';
import { assert, isOptional, isString } from 'typanion';
import { Logger } from 'winston';

export type ProxyOptions = {
  targetBaseURL: string;
  proxyName?: string;
  rewritePath?: (opts: {
    path: string | undefined;
    req: Request;
  }) => MaybePromise<string | undefined>;
  rewriteHeaders?: (opts: {
    headers: Headers;
    req: Request;
  }) => MaybePromise<Headers>;
  authorization?: (opts: {
    getCookie: (name: string) => string | undefined;
    req: Request;
  }) => MaybePromise<string | undefined>;
};

export class Proxy {
  private readonly app = new Hono();
  private readonly logger: Logger;

  constructor(opts: ProxyOptions) {
    const {
      targetBaseURL,
      proxyName,
      rewritePath,
      rewriteHeaders,
      authorization,
    } = opts;

    assert(targetBaseURL, isString());
    assert(proxyName, isOptional(isString()));

    this.logger = defaultLog.child({ prefix: `${proxyName ?? 'Proxy'}` });

    this.app.all('*', async (ctx) => {
      const requestURL = new URL(ctx.req.url);
      const requestSearchParams = requestURL.searchParams;

      const targetPathname = this._trimSlashes(
        rewritePath
          ? await rewritePath({ path: requestURL.pathname, req: ctx.req.raw })
          : requestURL.pathname,
      );

      const targetHeaders = rewriteHeaders
        ? await rewriteHeaders({
            headers: ctx.req.raw.headers,
            req: ctx.req.raw,
          })
        : ctx.req.raw.headers;

      const Authorization = await authorization?.({
        getCookie: (key: string) => getCookie(ctx, key),
        req: ctx.req.raw,
      });

      if (Authorization) {
        targetHeaders.append('authorization', Authorization);
      }

      const targetURL = new URL(
        `${targetBaseURL}/${targetPathname}${requestSearchParams.toString()}`,
      );

      this.logger.debug('PROXY_TARGET_URL', targetURL);

      const proxyResponse = await proxy(targetURL, {
        ...ctx.req,
        headers: targetHeaders,
        duplex: 'half',
      });

      this.logger.debug('PROXY_RESPONSE', proxyResponse);

      return proxyResponse;
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

  getApp() {
    return this.app;
  }
}
