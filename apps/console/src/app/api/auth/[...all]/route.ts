import { container } from '@/container';
import { env } from '@/env';
import { RequestLogFormatter } from '@repo/bff';
import { proxy } from '@repo/proxy';

const handler = async (request: Request): Promise<Response> => {
  const logger = container.resolve('logger');

  logger.debug('Request', RequestLogFormatter.logRequestInfo({ request }));

  const response = await proxy(env.AUTH_BASE_URL, request);

  logger.debug(
    'Response',
    RequestLogFormatter.logResponseInfo({
      request,
      response,
    }),
  );

  return response;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
