import {
  DeleteApiKeyRequestParamSchema,
  DeleteResponseSchema,
} from '@repo/validation';
import type { ZodOpenApiOperationObject } from 'zod-openapi';

export const DELETE = {
  requestParams: { path: DeleteApiKeyRequestParamSchema },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: DeleteResponseSchema,
        },
      },
    },
  },
} as const satisfies ZodOpenApiOperationObject;
