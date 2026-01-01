import { serve, type ServerType } from '@hono/node-server';
import { Hono } from 'hono';
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

import { Proxy } from '../../src/Proxy';

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
  it('should proxy a basic request', async () => {
    const proxyApp = new Proxy({ targetBaseURL });
    const req = new Request(`${targetBaseURL}/test`);
    const res = await proxyApp.handleRequest(req);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('target response');
  });

  it('should rewrite the path if rewritePath is provided', async () => {
    const rewritePath = vi.fn(({ path }) => `/api/v1${path}`);
    const proxyApp = new Proxy({ targetBaseURL, rewritePath });

    const req = new Request(`${targetBaseURL}/user`);
    const res = await proxyApp.handleRequest(req);

    expect(rewritePath).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('rewritten path');
  });

  it('should rewrite headers if rewriteHeaders is provided', async () => {
    const rewriteHeaders = vi.fn(({ headers }) => {
      const newHeaders = new Headers(headers);
      newHeaders.set('X-Custom-Header', 'value');
      return newHeaders;
    });
    const proxyApp = new Proxy({ targetBaseURL, rewriteHeaders });

    const req = new Request(`${targetBaseURL}/test-headers`);
    const res = await proxyApp.handleRequest(req);

    expect(rewriteHeaders).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('header: value');
  });

  it('should add authorization header if authorization is provided', async () => {
    const authorization = vi.fn(() => 'Bearer my-token');
    const proxyApp = new Proxy({ targetBaseURL, authorization });

    const req = new Request(`${targetBaseURL}/test-auth`);
    const res = await proxyApp.handleRequest(req);

    expect(authorization).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('auth: Bearer my-token');
  });

  it('should get authorization token from cookie', async () => {
    const authorization = vi.fn(({ cookies }) => `Bearer ${cookies['token']}`);
    const proxyApp = new Proxy({ targetBaseURL, authorization });

    const req = new Request(`${targetBaseURL}/test-auth`);
    req.headers.set('Cookie', 'token=cookie-token');
    const res = await proxyApp.handleRequest(req);

    expect(authorization).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('auth: Bearer cookie-token');
  });

  it('should handle query parameters', async () => {
    const proxyApp = new Proxy({ targetBaseURL });
    const req = new Request(`${targetBaseURL}/test-query?foo=bar`);
    const res = await proxyApp.handleRequest(req);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('query: bar');
  });

  it('should trim leading and trailing slashes from the path', async () => {
    const proxyApp = new Proxy({ targetBaseURL });
    const req = new Request(`${targetBaseURL}//test/path/`);
    const res = await proxyApp.handleRequest(req);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('trimmed path');
  });

  it('should forward request body', async () => {
    const proxyApp = new Proxy({ targetBaseURL });
    const body = { key: 'value' };
    const req = new Request(`${targetBaseURL}/test-body`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await proxyApp.handleRequest(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(body);
  });
});
