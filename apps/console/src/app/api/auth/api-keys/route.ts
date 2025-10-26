import { auth } from '@/server/auth';
import { prisma } from '@/server/prisma';
import { ApiKeyManager } from '@repo/api-key';
import { AuthProxy } from '@repo/proxy';
import { handle } from 'hono/vercel';

const proxy = new AuthProxy({
  apiKeyManager: new ApiKeyManager({
    prisma,
    encryptionKey: 'secret',
  }),
  prisma,
  originServerBaseURL: 'http://localhost:3001',
  authorization: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return session?.user.id;
  },
  rewritePath: (path) => path?.replace('api/', ''),
});

export const GET = handle(proxy.getApp());
export const POST = handle(proxy.getApp());
