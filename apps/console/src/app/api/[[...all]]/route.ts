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
