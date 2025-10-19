import '@repo/validation';
import {
  DeleteApiKeyParamRequestSchema,
  DeleteApiKeyResponseSchema,
  GetApiKeyParamRequestSchema,
  GetApiKeyResponseSchema,
  UpdateApiKeyBodyRequestSchema,
  UpdateApiKeyParamRequestSchema,
  UpdateApiKeyResponseSchema,
} from '@repo/validation';
import type { ZodOpenApiPathItemObject } from 'zod-openapi';

export default {
  get: {
    requestParams: {
      path: GetApiKeyParamRequestSchema,
    },
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
  put: {
    requestParams: {
      path: UpdateApiKeyParamRequestSchema,
    },
    requestBody: {
      content: {
        'application/json': {
          schema: UpdateApiKeyBodyRequestSchema,
        },
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: UpdateApiKeyResponseSchema,
          },
        },
      },
    },
  },
  delete: {
    requestParams: {
      path: DeleteApiKeyParamRequestSchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: DeleteApiKeyResponseSchema,
          },
        },
      },
    },
  },
} satisfies ZodOpenApiPathItemObject;
