import { AuthProxy } from '@repo/proxy';
import { handle } from 'hono/vercel';

const proxy = new AuthProxy({
  authURL: 'http://localhost:3002',
});

export const GET = handle(proxy.getApp());
export const POST = handle(proxy.getApp());
