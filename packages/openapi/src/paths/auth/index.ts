import type { ZodOpenApiPathsObject } from 'zod-openapi';

import apiKeys from './api-keys';
import apiKeysId from './api-keys@{id}';

export default {
  '/api-keys': apiKeys,
  '/api-keys/{id}': apiKeysId,
} satisfies ZodOpenApiPathsObject;
