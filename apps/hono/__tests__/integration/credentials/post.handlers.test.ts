import { env } from '@/env';
import type { Root } from '@/routes';
import { hc } from 'hono/client';
import { describe, test, expect } from 'vitest';

const testClient = hc<Root>(`http://localhost:${env.PORT}`);

describe('Credentials POST handler', () => {
  test('f', async () => {
    const response = await testClient.credentials.$post({
      json: {
        challenge: '',
        rp: {
          id: 'example.com',
          name: 'example.com',
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      },
    });

    console.log(response);

    expect(response.ok).toBe(true);

    const json = await response.json();

    expect(json).toMatchInlineSnapshot();
  });
});
