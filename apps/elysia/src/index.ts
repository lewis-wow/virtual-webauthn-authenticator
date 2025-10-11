import { Elysia } from 'elysia';
import { node } from '@elysiajs/node';
import { openapi } from '@elysiajs/openapi';

const app = new Elysia({ adapter: node() })
  .use(openapi())
  .get('/', () => 'Hello Elysia')
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
  });
