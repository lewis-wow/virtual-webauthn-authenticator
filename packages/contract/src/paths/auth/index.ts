import { addPrefixToKeys } from '@repo/utils';
import { type ZodOpenApiPathsObject } from 'zod-openapi';

import { apiKeys } from './api-keys';

export const auth = {
  ...addPrefixToKeys(apiKeys, '/auth'),
} as const satisfies ZodOpenApiPathsObject;
