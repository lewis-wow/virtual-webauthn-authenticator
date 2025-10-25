import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const TARGET_BASE_URL = 'http://localhost:3001';

const getBody = async (request: NextRequest) => {
  const contentLength = request.headers.get('content-length');

  // Check if it's missing, null, or '0'
  if (!contentLength || contentLength === '0') {
    // --- No body was sent ---
    // You can set body to undefined or an empty object
    return undefined;
    // ... continue your logic here
  } else {
    // --- A body likely exists ---
    // Now it's safer to try parsing it
    return JSON.stringify(await request.json());
  }
};

const proxyNextRequest = async (request: NextRequest) => {
  const requestUrl = new URL(request.url);
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  const body = await getBody(request);

  console.log('session', session);

  const response = await fetch(
    `${TARGET_BASE_URL}${requestUrl.pathname.replace('/api', '')}`,
    {
      method: request.method,
      headers: {
        ...requestHeaders,
        Authorization: `Bearer ${session?.session.token}`,
        'Content-Type': 'application/json',
      },
      body: body,
    },
  );

  console.log('response', response);

  const json = await response.json();
  const status = response.status;

  return NextResponse.json(json, { status });
};

export async function POST(request: NextRequest) {
  return await proxyNextRequest(request);
}

export async function GET(request: NextRequest) {
  return await proxyNextRequest(request);
}
