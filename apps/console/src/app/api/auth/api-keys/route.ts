import { Proxy } from '@repo/proxy';

const proxy = new Proxy({
  originServerBaseURL: 'http://localhost:3001',
  authorizationCookieName: 'session_token',
  rewritePath: (path) => path?.replace('api/', ''),
});

export const GET = proxy.nextjs();
export const POST = proxy.nextjs();
