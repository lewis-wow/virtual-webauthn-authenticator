import { assertSchema } from '@repo/assert';
import z from 'zod';

export const proxy = async (
  targetBaseUrl: string,
  request: Request,
): Promise<Response> => {
  assertSchema(targetBaseUrl, z.url());

  const requestURL = new URL(request.url);
  const requestSearchParams = requestURL.searchParams;
  const requestPathname = requestURL.pathname;

  const targetURL = new URL(`${targetBaseUrl}${requestPathname}`);
  targetURL.search = requestSearchParams.toString();

  const targetRequestInit = {
    ...({
      ...request,
    } satisfies RequestInit),
    duplex: 'half' as const, // Required for streaming request bodies
  };

  const targetResponse = await fetch(targetURL, targetRequestInit);

  return targetResponse;
};
