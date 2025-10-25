import { auth } from '@/server/auth';
import { Proxy } from '@repo/proxy';

const proxy = new Proxy({
  originServerBaseURL: 'http://localhost:3001',
  authorization: async ({ request }) => {
    const { token } = await auth.api.getToken({
      headers: request.headers,
    });

    return `Bearer ${token}`;
  },
  rewritePath: (path) => path?.replace('api/', ''),
});

export const GET = proxy.nextjs();
export const POST = proxy.nextjs();
