import { root } from '@/routes';
import { describe, test, expect, vi } from 'vitest';

import { USER_EMAIL, USER_ID, USER_NAME } from '../../helpers/consts';

const MOCK_USER_PAYLOAD = {
  id: USER_ID,
  email: USER_EMAIL,
  name: USER_NAME,
};

const mockContext = {
  var: {
    jwt: {
      validateToken: vi.fn().mockResolvedValue(MOCK_USER_PAYLOAD),
    },
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
    },
  },
};

describe('Healthcheck GET handler', () => {
  test('test', async () => {
    const response = await root.request(
      '/api/healthcheck',
      {
        headers: {
          Authorization: 'Bearer fake-valid-token',
        },
      },
      {
        f: 1,
      },
      {
        ...mockContext,
        waitUntil: vi.fn(),
        passThroughOnException: vi.fn(),
        props: {},
      },
    );

    const json = await response.json();

    expect(json).toMatchInlineSnapshot(`
      {
        "healthy": true,
        "user": null,
      }
    `);
  });
});
