import { env } from '@/env';
import { AuthType } from '@repo/auth/enums';
import { Proxy } from '@repo/proxy';
import { createAuthClient } from 'better-auth/client';
import { jwtClient } from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';

const handler = async (request: Request): Promise<Response> => {
  const authClient = createAuthClient({
    plugins: [jwtClient(), nextCookies()],
    baseURL: env.AUTH_BASE_URL,
  });

  const proxy = new Proxy({
    proxyName: 'API-Proxy',
    targetBaseURL: 'http://localhost:3001',
    authorization: async ({ request }) => {
      const xAuthTypeHeader = request.headers.get('X-Auth-Type');

      if (xAuthTypeHeader === AuthType.API_KEY) {
        const response = await fetch(
          `http://localhost:3002/api/auth/api-keys/token`,
          {
            method: 'GET',
            headers: request.headers,
          },
        );

        if (!response.ok) {
          return undefined;
        }

        const { token } = await response.json();

        console.log('TOKEN', token);

        return `Bearer ${token}`;
      }

      const headers = Object.fromEntries(request.headers.entries());
      console.log({ headers });
      const { data } = await authClient.token({
        fetchOptions: {
          headers: request.headers,
        },
      });

      console.log({ data });

      if (!data) {
        return undefined;
      }

      return `Bearer ${data.token}`;
    },
  });

  return await proxy.handleRequest(request);
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
