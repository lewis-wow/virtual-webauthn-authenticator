import { assertSchema } from '@repo/assert';
import z from 'zod';

export const proxy = async (
  targetBaseUrl: string,
  request: Request,
  options?: {
    headers?: Headers;
  },
): Promise<Response> => {
  assertSchema(targetBaseUrl, z.url());

  const requestURL = new URL(request.url);
  const requestSearchParams = requestURL.searchParams;
  const requestPathname = requestURL.pathname;

  const targetURL = new URL(`${targetBaseUrl}${requestPathname}`);
  targetURL.search = requestSearchParams.toString();

  const requestHeadersCopy = new Headers(request.headers);
  requestHeadersCopy.delete('host');

  const headersOverwrite = new Headers(options?.headers);

  const headers = new Headers([...requestHeadersCopy, ...headersOverwrite]);

  const targetRequestInit: RequestInit & { duplex: 'half' } = {
    method: request.method,
    headers: headers,
    body: request.body, // Pass the ReadableStream directly
    signal: request.signal, // Forward abort signals
    duplex: 'half', // Required for Node.js streaming
  };

  const targetResponse = await fetch(targetURL, targetRequestInit);

  const mutableResponse = new Response(targetResponse.body, {
    status: targetResponse.status,
    statusText: targetResponse.statusText,
    headers: targetResponse.headers,
  });

  return mutableResponse;
};
