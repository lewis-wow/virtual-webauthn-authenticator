import { ListApiKeysResponseSchema } from '@repo/validation';
import type { ZodOpenApiOperationObject } from 'zod-openapi';

export const GET = {
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: ListApiKeysResponseSchema,
        },
      },
    },
  },
} as const satisfies ZodOpenApiOperationObject;
