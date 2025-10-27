import { Hono } from 'hono';
import 'hono/cookie';
import { proxy } from 'hono/proxy';
import { assert, isString } from 'typanion';

export type AuthProxyOptions = {
  authURL: string;
  rewritePath?: (path: string | undefined) => string | undefined;
};

export class AuthProxy {
  private readonly app = new Hono();

  constructor(opts: AuthProxyOptions) {
    const { authURL, rewritePath } = opts;

    assert(authURL, isString());

    this.app.all('*', async (ctx) => {
      const requestURL = new URL(ctx.req.url);
      const requestSearchParams = requestURL.searchParams;

      const targetPathname = this._trimSlashes(
        rewritePath ? rewritePath(requestURL.pathname) : requestURL.pathname,
      );

      const targetURL = new URL(
        `${authURL}/${targetPathname}${requestSearchParams.toString()}`,
      );

      const response = await proxy(targetURL, {
        ...ctx.req,
        duplex: 'half',
        redirect: 'follow',
      });

      console.log('response', response);

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

  getApp() {
    return this.app;
  }
}
