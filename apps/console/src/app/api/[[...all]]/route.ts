import { container } from '@/container';
import { proxy } from '@repo/proxy';
import { cookies } from 'next/headers';

const handler = async (request: Request): Promise<Response> => {
  const bffLogger = container.resolve('bffLogger');
  const tokenFetch = container.resolve('tokenFetch');

  bffLogger.logRequest(request);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token');

  let jwt: string | null = null;
  if (sessionToken !== undefined) {
    jwt = await tokenFetch.fetchToken(sessionToken.value, {
      headers: request.headers,
    });
  }

  const response = await proxy('http://localhost:3001', request, {
    headers: new Headers({
      Authorization: `Bearer ${jwt}`,
    }),
  });

  bffLogger.logResponse(request, response);

  return response;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
