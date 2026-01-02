import { env } from '@/env';
import { proxy } from '@repo/proxy';

const handler = async (request: Request): Promise<Response> => {
  console.log('request', request);

  const response = await proxy(env.AUTH_BASE_URL, request);

  console.log('response', response);

  return response;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
