import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

type RequestWithHeaders =
  | Pick<Request, 'headers'>
  | Pick<IncomingMessage, 'headers'>;

export const getRequestId = (req: RequestWithHeaders): string => {
  let requestId: string | null = null;

  // 1. Check if it's a web standard Headers object
  if (req.headers instanceof Headers) {
    // .get() is case-insensitive
    requestId = req.headers.get('X-Request-Id');
  }
  // 2. Otherwise, treat it as a Node.js headers object
  else {
    // Node.js headers are lowercased and can be string, string[], or undefined
    const headerValue = req.headers['x-request-id'];

    if (Array.isArray(headerValue)) {
      // If the header was sent multiple times, take the first value
      requestId = headerValue[0] ?? null;
    } else {
      requestId = headerValue ?? null;
    }
  }

  return requestId ?? randomUUID();
};
