import { authClient } from '@/lib/authClient';
import { Proxy } from '@repo/proxy';
import { handle } from 'hono/vercel';

const proxy = new Proxy({
  proxyName: 'API-Proxy',
  targetBaseURL: 'http://localhost:3001',
  authorization: async () => {
    const { data } = await authClient.token();

    console.log('authorization', { data });

    if (!data) {
      return undefined;
    }

    return `Bearer ${data.token}`;
  },
});

export const GET = handle(proxy.getApp());
export const POST = handle(proxy.getApp());
