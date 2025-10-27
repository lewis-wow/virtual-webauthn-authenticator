import { root } from '@/routes';
import { describe, test, expect, vi } from 'vitest';

import { USER_EMAIL, USER_ID, USER_NAME } from '../../helpers/consts';

const MOCK_USER_PAYLOAD = {
  id: USER_ID,
  email: USER_EMAIL,
  name: USER_NAME,
};

vi.mock(import('@/middlewares/jwtMiddleware'), () => {
  const jwtMiddleware = vi.fn((ctx, next) => {
    ctx.set('user', MOCK_USER_PAYLOAD);
    return next();
  });

  return { jwtMiddleware };
});

describe('Healthcheck GET handler', () => {
  test('test', async () => {
    const response = await root.request('/api/healthcheck', {
      headers: {
        Authorization: 'Bearer fake-valid-token',
      },
    });

    const json = await response.json();

    expect(json).toMatchInlineSnapshot(`
      {
        "healthy": true,
        "user": {
          "email": "john.doe@example.com",
          "id": "4bdeaf3a-4b6b-4bc0-a9c9-84a3bc996dc4",
          "name": "John Doe",
        },
      }
    `);
  });
});
