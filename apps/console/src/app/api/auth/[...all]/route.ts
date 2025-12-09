import { env } from '@/env';
import { Proxy } from '@repo/proxy';

const handler = async (request: Request): Promise<Response> => {
  const proxy = new Proxy({
    proxyName: 'Auth-Proxy',
    targetBaseURL: env.AUTH_BASE_URL,
  });

  return await proxy.handleRequest(request);
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
