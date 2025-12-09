import { Proxy } from '@repo/proxy';

const proxy = new Proxy({
  proxyName: 'Auth-Proxy',
  targetBaseURL: 'http://localhost:3002',
});

export const GET = proxy.handleRequest.bind(proxy);
export const POST = proxy.handleRequest.bind(proxy);
export const PUT = proxy.handleRequest.bind(proxy);
export const DELETE = proxy.handleRequest.bind(proxy);
