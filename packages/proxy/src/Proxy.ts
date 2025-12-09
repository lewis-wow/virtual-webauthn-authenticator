import { Logger } from '@repo/logger';
import type { MaybePromise } from '@repo/types';
import { parse, type Cookies } from 'cookie';
import { assert, isOptional, isString } from 'typanion';

export type RewriteHeaders = (opts: {
  headers: Headers;
  request: Request;
}) => MaybePromise<Headers>;

export type RewritePath = (opts: {
  path: string | undefined;
  request: Request;
}) => MaybePromise<string | undefined>;

export type GetAuthorization = (opts: {
  cookies: Cookies;
  request: Request;
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
  private readonly logger: Logger;

  private readonly targetBaseURL: string;
  private readonly proxyName?: string;
  private readonly rewritePath?: RewritePath;
  private readonly rewriteHeaders?: RewriteHeaders;
  private readonly authorization?: GetAuthorization;

  constructor(opts: ProxyOptions) {
    assert(opts.targetBaseURL, isString());
    assert(opts.proxyName, isOptional(isString()));

    this.targetBaseURL = opts.targetBaseURL;
    this.proxyName = opts.proxyName;
    this.rewritePath = opts.rewritePath;
    this.rewriteHeaders = opts.rewriteHeaders;
    this.authorization = opts.authorization;

    // Initialize the logger with a specific prefix.
    this.logger = new Logger({ prefix: `${this.proxyName ?? 'Proxy'}` });

    this.logger.debug('PROXY_INITIALIZED');
  }

  async handleRequest(request: Request): Promise<Response> {
    const requestURL = new URL(request.url);
    const requestSearchParams = requestURL.searchParams;

    // Determine the target path:
    // 1. Use the original pathname.
    // 2. If `rewritePath` is provided, use it to transform the path.
    // 3. Trim any leading/trailing slashes.
    const targetPathname = this._trimSlashes(
      this.rewritePath
        ? await this.rewritePath({ path: requestURL.pathname, request })
        : requestURL.pathname,
    );

    const targetHeaders = this.rewriteHeaders
      ? await this.rewriteHeaders({
          headers: request.headers,
          request,
        })
      : request.headers;

    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parse(cookieHeader);

    const authorizationHeader = await this.authorization?.({
      cookies,
      request,
    });

    if (authorizationHeader) {
      targetHeaders.set('Authorization', authorizationHeader);
    }

    if (this._requestHasBody(request) && !targetHeaders.has('Content-Type')) {
      targetHeaders.set('Content-Type', 'application/json');
    }
    const bodyText = await request.text();
    const hasBody = bodyText.length > 0;

    const targetURL = new URL(`${this.targetBaseURL}/${targetPathname}`);
    targetURL.search = requestSearchParams.toString();

    this.logger.debug('PROXY_TARGET_URL', targetURL);

    const proxyInit = {
      ...({
        ...request,
        method: request.method,
        headers: targetHeaders,
        body: hasBody ? bodyText : undefined,
      } satisfies RequestInit),
      duplex: 'half' as const, // Required for streaming request bodies
    };

    const proxyResponse = await fetch(targetURL, proxyInit);

    this.logger.debug('PROXY_RESPONSE', proxyResponse);

    // Return the response from the target service back to the original client.
    return proxyResponse;
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
}
