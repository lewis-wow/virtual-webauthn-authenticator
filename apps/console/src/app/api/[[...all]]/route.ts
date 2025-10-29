import { Proxy } from '@repo/proxy';
import { createAuthClient } from 'better-auth/client';
import { jwtClient } from 'better-auth/client/plugins';
import { handle } from 'hono/vercel';

export const authClient = createAuthClient({
  plugins: [jwtClient()],
});

const proxy = new Proxy({
  proxyName: 'API-Proxy',
  targetBaseURL: 'http://localhost:3001',
  authorization: async ({ req }) => {
    const { data, error } = await authClient.token({
      fetchOptions: {
        headers: req.headers,
      },
    });

    if (data) {
      return `Bearer ${data.token}`;
    }

    const response = await fetch(
      `http://localhost:3002/api/auth/api-key/token`,
      {
        headers: req.headers,
      },
    );

    if (response.ok) {
      const { token } = await response.json();

      return `Bearer ${token}`;
    }

    return undefined;
  },
});

export const GET = handle(proxy.getApp());
export const POST = handle(proxy.getApp());
