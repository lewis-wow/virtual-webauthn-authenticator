import { type ZodOpenApiPathsObject } from 'zod-openapi';

import { DELETE } from './delete.handler';
import { GET } from './get.handler';
import { PUT } from './put.handler';

export const apiKey = {
  '/{id}': {
    get: GET,
    put: PUT,
    delete: DELETE,
  },
} as const satisfies ZodOpenApiPathsObject;
