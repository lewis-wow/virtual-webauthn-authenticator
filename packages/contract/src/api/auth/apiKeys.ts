import {
  CreateApiKeyRequestBodySchema,
  CreateApiKeyResponseSchema,
  DeleteApiKeyRequestParamSchema,
  DeleteApiKeyResponseSchema,
  GetApiKeyRequestParamSchema,
  GetApiKeyResponseSchema,
  GetTokenApiKeysResponseSchema,
  ListApiKeysResponseSchema,
  UpdateApiKeyRequestBodySchema,
  UpdateApiKeyRequestParamSchema,
  UpdateApiKeyResponseSchema,
} from '@repo/validation';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const apiKeysRouter = c.router({
  create: {
    method: 'POST',
    path: '/api-keys',
    body: CreateApiKeyRequestBodySchema,
    responses: {
      200: CreateApiKeyResponseSchema,
    },
  },
  list: {
    method: 'GET',
    path: '/api-keys',
    responses: {
      200: ListApiKeysResponseSchema,
    },
  },
  getToken: {
    method: 'GET',
    path: '/api-keys/token',
    responses: {
      200: GetTokenApiKeysResponseSchema,
    },
  },
  get: {
    method: 'GET',
    path: '/api-keys/:id',
    pathParams: GetApiKeyRequestParamSchema,
    responses: {
      200: GetApiKeyResponseSchema,
    },
  },
  update: {
    method: 'PUT',
    path: '/api-keys/:id',
    pathParams: UpdateApiKeyRequestParamSchema,
    body: UpdateApiKeyRequestBodySchema,
    responses: {
      200: UpdateApiKeyResponseSchema,
    },
  },
  delete: {
    method: 'DELETE',
    path: '/api-keys/:id',
    pathParams: DeleteApiKeyRequestParamSchema,
    responses: {
      200: DeleteApiKeyResponseSchema,
    },
  },
});
