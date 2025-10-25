import { ApikeySchema, CreateApiKeyRequestBodySchema } from '@repo/validation';
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
          schema: ApikeySchema,
        },
      },
    },
  },
} as const satisfies ZodOpenApiOperationObject;
