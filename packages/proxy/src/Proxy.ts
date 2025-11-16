import { Logger } from '@repo/logger';
import type { MaybePromise } from '@repo/types';
import { Hono } from 'hono';
import 'hono/cookie';
import { getCookie } from 'hono/cookie';
import { proxy } from 'hono/proxy';
import { assert, isOptional, isString } from 'typanion';

export type RewriteHeaders = (opts: {
  headers: Headers;
  req: Request;
}) => MaybePromise<Headers>;

export type RewritePath = (opts: {
  path: string | undefined;
  req: Request;
}) => MaybePromise<string | undefined>;

export type GetAuthorization = (opts: {
  getCookie: (name: string) => string | undefined;
  req: Request;
}) => MaybePromise<string | undefined>;

/**
 * Defines the configuration options for the Proxy.
 */
export type ProxyOptions = {
  /** The base URL of the target service to proxy requests to. */
  targetBaseURL: string;
  /** An optional name for logging purposes. */
  proxyName?: string;
  /** An optional function to modify the request path before proxying. */
  rewritePath?: RewritePath;
  /** An optional function to modify request headers before proxying. */
  rewriteHeaders?: RewriteHeaders;
  /** An optional function to get an authorization token (e.g., from cookies) to add to the proxy request. */
  authorization?: GetAuthorization;
};

/**
 *
 * A simple proxy server class built on Hono.
 * It intercepts all requests, applies optional transformations,
 * and forwards them to a specified target URL.
 */
export class Proxy {
  // The Hono app instance that handles routing.
  private readonly app = new Hono();
  // Logger for debugging.
  private readonly logger: Logger;

  constructor(opts: ProxyOptions) {
    const {
      targetBaseURL,
      proxyName,
      rewritePath,
      rewriteHeaders,
      authorization,
    } = opts;

    // Validate the required targetBaseURL.
    assert(targetBaseURL, isString());
    assert(proxyName, isOptional(isString()));

    // Initialize the logger with a specific prefix.
    this.logger = new Logger({ prefix: `${proxyName ?? 'Proxy'}` });

    this.logger.debug('PROXY_INITIALIZED');

    // Register a middleware to handle all incoming requests ('*').
    this.app.all('*', async (ctx) => {
      // Parse the incoming request URL.
      const requestURL = new URL(ctx.req.url);
      const requestSearchParams = requestURL.searchParams;

      // Determine the target path:
      // 1. Use the original pathname.
      // 2. If `rewritePath` is provided, use it to transform the path.
      // 3. Trim any leading/trailing slashes.
      const targetPathname = this._trimSlashes(
        rewritePath
          ? await rewritePath({ path: requestURL.pathname, req: ctx.req.raw })
          : requestURL.pathname,
      );

      const targetHeaders = rewriteHeaders
        ? await rewriteHeaders({
            req: ctx.req.raw,
            headers: ctx.req.raw.headers,
          })
        : ctx.req.raw.headers;

      const Authorization = await authorization?.({
        getCookie: (key: string) => getCookie(ctx, key),
        req: ctx.req.raw,
      });

      if (Authorization) {
        targetHeaders.set('Authorization', Authorization);
      }

      if (
        this._requestHasBody(ctx.req.raw) &&
        !targetHeaders.has('Content-Type')
      ) {
        targetHeaders.set('Content-Type', 'application/json');
      }

      // Construct the final target URL to proxy to.
      const targetURL = new URL(`${targetBaseURL}/${targetPathname}`);
      targetURL.search = requestSearchParams.toString();

      this.logger.debug('PROXY_TARGET_URL', targetURL);

      // Prepare the request init object for the `proxy` function.
      // We spread the original request but override the headers.
      const proxyInit = {
        ...({ ...ctx.req, headers: targetHeaders } satisfies RequestInit),
        duplex: 'half' as const, // Required for streaming request bodies
      };

      const body = await ctx.req.text();

      // Call Hono's proxy helper to forward the request and get the response.
      const proxyResponse = await proxy(targetURL, {
        ...proxyInit,
        body: body.length > 0 ? body : undefined,
      });

      this.logger.debug('PROXY_RESPONSE', proxyResponse);

      // Return the response from the target service back to the original client.
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
    // ^\/+ - One or more slashes at the beginning of the string
    // |    - OR
    // \/+$ - One or more slashes at the end of the string
    //
    // The 'g' (global) flag ensures it replaces both if they exist.
    return path?.replace(/^\/+|\/+$/g, '');
  }

  private _requestHasBody(request: Request): boolean {
    const contentLength = request.headers.get('content-length');
    const transferEncoding = request.headers.get('transfer-encoding');

    // A body is present if Content-Length > 0 OR if it's chunked.
    const hasBody =
      (contentLength != null && contentLength !== '0') ||
      transferEncoding === 'chunked';

    return hasBody;
  }

  /**
   * Exposes the Hono app instance, allowing it to be used as middleware
   * in another Hono app or run as a standalone server.
   */
  getApp() {
    return this.app;
  }
}
