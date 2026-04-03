import { container } from '@/container';
import { BearerTokenMapper } from '@repo/auth/mappers';
import { RequestLogFormatter } from '@repo/bff';
import { proxy } from '@repo/proxy';
import { cookies } from 'next/headers';

const handler = async (request: Request): Promise<Response> => {
  const logger = container.resolve('logger');
  const tokenFetch = container.resolve('tokenFetch');

  logger.debug('Request', RequestLogFormatter.logRequestInfo({ request }));

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token');

  let jwt: string | null = null;
  if (sessionToken !== undefined) {
    jwt = await tokenFetch.fetchToken(sessionToken.value, {
      headers: request.headers,
    });
  }

  const response = await proxy('http://localhost:3001', request, {
    headers: {
      Authorization: jwt ? BearerTokenMapper.toBearerToken(jwt) : null,
    },
  });

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
