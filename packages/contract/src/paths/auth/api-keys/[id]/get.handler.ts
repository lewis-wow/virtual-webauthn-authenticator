import {
  GetApiKeyRequestParamSchema,
  GetApiKeyResponseSchema,
} from '@repo/validation';
import type { ZodOpenApiOperationObject } from 'zod-openapi';

export const GET = {
  requestParams: { path: GetApiKeyRequestParamSchema },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: GetApiKeyResponseSchema,
        },
      },
    },
  },
} as const satisfies ZodOpenApiOperationObject;
