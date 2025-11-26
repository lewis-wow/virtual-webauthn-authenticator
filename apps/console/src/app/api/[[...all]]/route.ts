import { AuthType } from '@repo/auth/enums';
import { Proxy } from '@repo/proxy';
import { createAuthClient } from 'better-auth/client';
import { jwtClient } from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';
import { handle } from 'hono/vercel';

const authClient = createAuthClient({
  plugins: [jwtClient(), nextCookies()],
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  baseURL: process.env.AUTH_BASE_URL,
});

const proxy = new Proxy({
  proxyName: 'API-Proxy',
  targetBaseURL: 'http://localhost:3001',
  authorization: async ({ req }) => {
    const xAuthTypeHeader = req.headers.get('X-Auth-Type');

    if (xAuthTypeHeader === AuthType.API_KEY) {
      const response = await fetch(
        `http://localhost:3002/api/auth/api-keys/token`,
        {
          method: 'GET',
          headers: req.headers,
        },
      );

      if (!response.ok) {
        return undefined;
      }

      const { token } = await response.json();

      console.log('TOKEN', token);

      return `Bearer ${token}`;
    }

    const { data } = await authClient.token({
      fetchOptions: {
        headers: req.headers,
      },
    });

    if (!data) {
      return undefined;
    }

    return `Bearer ${data.token}`;
  },
});

export const GET = handle(proxy.getApp());
export const POST = handle(proxy.getApp());
