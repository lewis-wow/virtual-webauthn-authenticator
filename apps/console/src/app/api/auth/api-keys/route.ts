import { auth } from '@/server/auth';
import { jwt } from '@/server/jwt';
import { AuthProxy } from '@repo/proxy';
import { handle } from 'hono/vercel';
import { headers } from 'next/headers';

const proxy = new AuthProxy({
  jwt,
  originServerBaseURL: 'http://localhost:3001',
  getUserInfo: async () => {
    const session = await auth.api
      .getSession({
        headers: await headers(),
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return session?.user;
  },
  rewritePath: (path) => path?.replace('api/', ''),
});

export const GET = handle(proxy.getApp());
export const POST = handle(proxy.getApp());
