import { Unauthorized } from '@repo/exception';
import { Jwt } from '@repo/jwt';
import { type PrismaClient, type User } from '@repo/prisma';
import type { MaybePromise } from '@repo/types';
import { Hono } from 'hono';
import 'hono/cookie';
import { getCookie } from 'hono/cookie';
import { proxy } from 'hono/proxy';
import { assert, isString } from 'typanion';

export type AuthProxyOptions = {
  jwt: Jwt;
  originServerBaseURL: string;
  getUserInfo: (opts: {
    request: Request;
    cookie: (name: string) => string | undefined;
  }) => MaybePromise<
    (Partial<Omit<User, 'id'>> & Pick<User, 'id'>) | undefined
  >;
  rewritePath?: (path: string | undefined) => string | undefined;
};

export class AuthProxy {
  private readonly jwt: Jwt;

  private readonly app = new Hono();

  constructor(opts: AuthProxyOptions) {
    this.jwt = opts.jwt;

    const { originServerBaseURL, getUserInfo, rewritePath } = opts;

    assert(originServerBaseURL, isString());

    this.app.all('*', async (ctx) => {
      const path = this._trimSlashes(
        rewritePath ? rewritePath(ctx.req.path) : ctx.req.path,
      );

      const user = await getUserInfo({
        request: ctx.req.raw,
        cookie: (key: string) => getCookie(ctx, key),
      });

      if (!user) {
        throw new Unauthorized();
      }

      const jwt = await this.jwt.sign(user);

      const headers = new Headers({
        authorization: `Bearer ${jwt}`,
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

  getApp() {
    return this.app;
  }
}
