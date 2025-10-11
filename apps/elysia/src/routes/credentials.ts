import { Elysia } from 'elysia';

const credentials = new Elysia({ prefix: '/credentials' })
  .get('/', (ctx) => {})
  .post('/', (ctx) => {});
