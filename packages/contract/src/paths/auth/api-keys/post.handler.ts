import {
  CreateApiKeyRequestBodySchema,
  CreateApiKeyResponseSchema,
} from '@repo/validation';
import type { ZodOpenApiOperationObject } from 'zod-openapi';

export const POST = {
  requestBody: {
    content: { 'application/json': { schema: CreateApiKeyRequestBodySchema } },
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: CreateApiKeyResponseSchema,
        },
      },
    },
  },
} as const satisfies ZodOpenApiOperationObject;
