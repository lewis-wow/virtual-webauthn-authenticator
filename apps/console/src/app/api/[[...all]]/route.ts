import { env } from '@/env';
import { proxy } from '@repo/proxy';
import { omitUndefined } from '@repo/utils';
import { createAuthClient } from 'better-auth/client';
import { jwtClient } from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';

const handler = async (request: Request): Promise<Response> => {
  const authClient = createAuthClient({
    plugins: [jwtClient(), nextCookies()],
    baseURL: env.AUTH_BASE_URL,
  });

  const { data } = await authClient.token({
    fetchOptions: {
      headers: request.headers,
    },
  });

  let Authorization: string | undefined = undefined;
  if (data !== null) {
    Authorization = `Bearer ${data.token}`;
  }

  const response = await proxy('http://localhost:3001', request, {
    headers: new Headers(
      omitUndefined({
        Authorization,
      }),
    ),
  });

  return response;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
