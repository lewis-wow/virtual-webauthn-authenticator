import {
  UpdateApiKeyRequestBodySchema,
  UpdateApiKeyRequestParamSchema,
  UpdateApiKeyResponseSchema,
} from '@repo/validation';
import type { ZodOpenApiOperationObject } from 'zod-openapi';

export const PUT = {
  requestParams: { path: UpdateApiKeyRequestParamSchema },
  requestBody: {
    content: { 'application/json': { schema: UpdateApiKeyRequestBodySchema } },
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: UpdateApiKeyResponseSchema,
        },
      },
    },
  },
} as const satisfies ZodOpenApiOperationObject;
