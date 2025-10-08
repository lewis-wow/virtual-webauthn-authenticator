import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Environment } from '@repo/enums';
import { prisma } from './prisma.js';

const app = new Hono();

app.get('/', (c) => {
  console.log(prisma, Environment);
  return c.text('Hello Hono!');
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
