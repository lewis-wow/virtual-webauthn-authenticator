import { serve, type ServerType } from '@hono/node-server';
import { Hono } from 'hono';
import { vi, describe, test, expect, beforeAll, afterAll } from 'vitest';

import { proxy } from '../../src/proxy';

let targetServer: ServerType;
let targetBaseURL: string;

// Target Hono App for testing
const targetApp = new Hono();

targetApp.get('/test', (c) => c.text('target response'));
targetApp.get('/api/v1/user', (c) => c.text('rewritten path'));
targetApp.get('/test-headers', (c) => {
  const customHeader = c.req.header('X-Custom-Header');
  return c.text(`header: ${customHeader}`);
});
targetApp.get('/test-auth', (c) => {
  const authHeader = c.req.header('authorization');
  return c.text(`auth: ${authHeader}`);
});
targetApp.get('/test-query', (c) => {
  const foo = c.req.query('foo');
  return c.text(`query: ${foo}`);
});
targetApp.post('/test-body', async (c) => {
  const body = await c.req.json();
  return c.json(body);
});
targetApp.get('/test/path', (c) => c.text('trimmed path'));

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    targetServer = serve({ fetch: targetApp.fetch, port: 0 }, (info) => {
      targetBaseURL = `http://localhost:${info.port}`;
      resolve();
    });
  });
});

afterAll(() => {
  targetServer.close();
});

describe('Proxy with HTTP calls', () => {
  test('should proxy a basic request', async () => {
    const req = new Request(`${targetBaseURL}/test`);
    const res = await proxy(targetBaseURL, req);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('target response');
  });

  test('should rewrite the path if rewritePath is provided', async () => {
    const rewritePath = vi.fn(({ path }) => `/api/v1${path}`);
    const rewrittenPath = rewritePath({ path: '/user' });

    const req = new Request(`${targetBaseURL}${rewrittenPath}`);
    const res = await proxy(targetBaseURL, req);

    expect(rewritePath).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('rewritten path');
  });

  test('should rewrite headers if rewriteHeaders is provided', async () => {
    const rewriteHeaders = vi.fn(({ headers }) => {
      const newHeaders = new Headers(headers);
      newHeaders.set('X-Custom-Header', 'value');
      return newHeaders;
    });

    const req = new Request(`${targetBaseURL}/test-headers`);
    const customHeaders = rewriteHeaders({ headers: req.headers });
    const res = await proxy(targetBaseURL, req, { headers: customHeaders });

    expect(rewriteHeaders).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('header: value');
  });

  test('should add authorization header if authorization is provided', async () => {
    const authorization = vi.fn(() => 'Bearer my-token');
    const authHeaders = new Headers();
    authHeaders.set('authorization', authorization());

    const req = new Request(`${targetBaseURL}/test-auth`);
    const res = await proxy(targetBaseURL, req, { headers: authHeaders });

    expect(authorization).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('auth: Bearer my-token');
  });

  test('should get authorization token from cookie', async () => {
    const parseCookies = (cookieHeader: string) => {
      const cookies: Record<string, string> = {};
      cookieHeader.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=') as [string, string];
        cookies[key] = value;
      });
      return cookies;
    };

    const authorization = vi.fn(({ cookies }) => `Bearer ${cookies['token']}`);
    const req = new Request(`${targetBaseURL}/test-auth`);
    req.headers.set('Cookie', 'token=cookie-token');

    const cookies = parseCookies(req.headers.get('Cookie') || '');
    const authHeaders = new Headers();
    authHeaders.set('authorization', authorization({ cookies }));

    const res = await proxy(targetBaseURL, req, { headers: authHeaders });

    expect(authorization).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('auth: Bearer cookie-token');
  });

  test('should handle query parameters', async () => {
    const req = new Request(`${targetBaseURL}/test-query?foo=bar`);
    const res = await proxy(targetBaseURL, req);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('query: bar');
  });

  test('should forward request body', async () => {
    const body = { key: 'value' };
    const req = new Request(`${targetBaseURL}/test-body`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await proxy(targetBaseURL, req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(body);
  });
});
