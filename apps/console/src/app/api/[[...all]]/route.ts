import { AuthType } from '@repo/auth/enums';
import { Proxy } from '@repo/proxy';
import { createAuthClient } from 'better-auth/client';
import { jwtClient } from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';
import { handle } from 'hono/vercel';

const authClient = createAuthClient({
  plugins: [jwtClient(), nextCookies()],
  // No baseURL - uses relative paths which go through console's own /api/auth proxy
});

const proxy = new Proxy({
  proxyName: 'API-Proxy',
  targetBaseURL: process.env.API_BASE_URL || 'http://localhost:3001',
  authorization: async ({ req }) => {
    const xAuthTypeHeader = req.headers.get('X-Auth-Type');

    if (xAuthTypeHeader === AuthType.API_KEY) {
      const authBaseUrl = process.env.AUTH_BASE_URL || 'http://localhost:3002';
      const response = await fetch(`${authBaseUrl}/api/auth/api-keys/token`, {
        method: 'GET',
        headers: req.headers,
      });

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
        baseURL: process.env.AUTH_BASE_URL || 'http://localhost:3002',
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
export const PUT = handle(proxy.getApp());
export const DELETE = handle(proxy.getApp());
