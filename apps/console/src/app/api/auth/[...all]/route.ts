import { container } from '@/container';
import { env } from '@/env';
import { proxy } from '@repo/proxy';

const handler = async (request: Request): Promise<Response> => {
  const bffLogger = container.resolve('bffLogger');

  bffLogger.logRequest(request);

  const response = await proxy(env.AUTH_BASE_URL, request);

  bffLogger.logResponse(request, response);

  return response;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
