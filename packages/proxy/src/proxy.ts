import { assertSchema } from '@repo/assert';
import z from 'zod';

export const proxy = async (
  targetBaseUrl: string,
  request: Request,
  options?: {
    headers?: Record<string, string | undefined | null>;
  },
): Promise<Response> => {
  assertSchema(targetBaseUrl, z.url());

  const requestURL = new URL(request.url);
  const requestSearchParams = requestURL.searchParams;
  const requestPathname = requestURL.pathname;

  const targetURL = new URL(`${targetBaseUrl}${requestPathname}`);
  targetURL.search = requestSearchParams.toString();

  const headers = new Headers(request.headers);
  headers.delete('host');

  if (options?.headers) {
    for (const [header, value] of Object.entries(options.headers)) {
      // Skip if value is undefined - leave header unchanged
      if (value === undefined) {
        continue;
      }

      // Delete header if value is explicitly null
      if (value === null) {
        headers.delete(header);
        continue;
      }

      // Set header to the provided value
      headers.set(header, value);
    }
  }

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
