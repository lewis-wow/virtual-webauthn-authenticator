import {
  CreateApiKeySchema,
  DeleteApiKeySchema,
  GetApiKeySchema,
  UdpateApiKeySchema,
} from '@repo/validation';
import type { ZodOpenApiPathItemObject } from 'zod-openapi';

export const apiKeysPath: ZodOpenApiPathItemObject = {
  get: {
    requestParams: {
      path: GetApiKeySchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {},
        },
      },
    },
  },
  post: {
    requestBody: {
      content: {
        'application/json': {
          schema: CreateApiKeySchema,
        },
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {},
        },
      },
    },
  },
  put: {
    requestParams: {
      path: GetApiKeySchema,
    },
    requestBody: {
      content: {
        'application/json': {
          schema: UdpateApiKeySchema,
        },
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {},
        },
      },
    },
  },
  delete: {
    requestParams: {
      path: DeleteApiKeySchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {},
        },
      },
    },
  },
};
