import type { MaybePromise } from '@repo/types';
import { Hono } from 'hono';
import 'hono/cookie';
import { getCookie } from 'hono/cookie';
import { proxy } from 'hono/proxy';
import { handle } from 'hono/vercel';
import { assert, isString } from 'typanion';

export type ProxyOptions = {
  originServerBaseURL: string;
  authorization?: (opts: {
    request: Request;
    cookie: (name: string) => string | undefined;
  }) => MaybePromise<string | undefined>;
  rewritePath?: (path: string | undefined) => string | undefined;
};

export class Proxy {
  private readonly app = new Hono();

  constructor(opts: ProxyOptions) {
    const { originServerBaseURL, authorization, rewritePath } = opts;

    assert(originServerBaseURL, isString());

    this.app.all('*', async (ctx) => {
      const path = this._trimSlashes(
        rewritePath ? rewritePath(ctx.req.path) : ctx.req.path,
      );

      const Authorization = await authorization?.({
        request: ctx.req.raw,
        cookie: (key: string) => getCookie(ctx, key),
      });

      const response = await proxy(`${originServerBaseURL}/${path}`, {
        headers: {
          ...ctx.req.header(),
          'X-Forwarded-For': '127.0.0.1',
          'X-Forwarded-Host': ctx.req.header('host'),
          Authorization,
        },
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

  nextjs() {
    return handle(this.app);
  }
}
