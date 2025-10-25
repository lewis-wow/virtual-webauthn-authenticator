import { addPrefixToKeys } from '@repo/utils';
import { type ZodOpenApiPathsObject } from 'zod-openapi';

import { apiKey } from './[id]';
import { GET } from './get.handler';
import { POST } from './post.handler';

export const apiKeys = {
  '/api-keys': {
    get: GET,
    post: POST,
  },
  ...addPrefixToKeys(apiKey, '/api-keys'),
} as const satisfies ZodOpenApiPathsObject;
