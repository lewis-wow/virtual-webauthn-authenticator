import '@repo/validation';
import {
  CreateApiKeyBodyRequestSchema,
  CreateApiKeyResponseSchema,
  GetApiKeyResponseSchema,
} from '@repo/validation';
import type { ZodOpenApiPathItemObject } from 'zod-openapi';

export default {
  get: {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: GetApiKeyResponseSchema,
          },
        },
      },
    },
  },
  post: {
    requestBody: {
      content: {
        'application/json': {
          schema: CreateApiKeyBodyRequestSchema,
        },
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: CreateApiKeyResponseSchema,
          },
        },
      },
    },
  },
} satisfies ZodOpenApiPathItemObject;
