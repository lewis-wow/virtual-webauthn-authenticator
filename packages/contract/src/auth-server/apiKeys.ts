import '@standard-schema/spec';
import { initContract } from '@ts-rest/core';

import {
  CreateApiKeyBodySchema,
  CreateApiKeyResponseSchema,
} from '../dto/api-keys/CreateApiKey';
import {
  DeleteApiKeyParamsSchema,
  DeleteApiKeyResponseSchema,
} from '../dto/api-keys/DeleteApiKey';
import {
  GetApiKeyParamsSchema,
  GetApiKeyResponseSchema,
} from '../dto/api-keys/GetApiKey';
import { GetTokenApiKeyResponseSchema } from '../dto/api-keys/GetTokenApiKey';
import {
  ListApiKeysQuerySchema,
  ListApiKeysResponseSchema,
} from '../dto/api-keys/ListApiKeys';
import {
  UpdateApiKeyBodySchema,
  UpdateApiKeyParamsSchema,
  UpdateApiKeyResponseSchema,
} from '../dto/api-keys/UpdateApiKey';

const c = initContract();

export const apiKeysRouter = c.router({
  create: {
    method: 'POST',
    path: '/api-keys',
    body: CreateApiKeyBodySchema,
    responses: {
      200: CreateApiKeyResponseSchema,
    },
  },
  list: {
    method: 'GET',
    path: '/api-keys',
    query: ListApiKeysQuerySchema,
    responses: {
      200: ListApiKeysResponseSchema,
    },
  },
  getToken: {
    method: 'GET',
    path: '/api-keys/token',
    responses: {
      200: GetTokenApiKeyResponseSchema,
    },
  },
  get: {
    method: 'GET',
    path: '/api-keys/:id',
    pathParams: GetApiKeyParamsSchema,
    responses: {
      200: GetApiKeyResponseSchema,
    },
  },
  update: {
    method: 'PUT',
    path: '/api-keys/:id',
    pathParams: UpdateApiKeyParamsSchema,
    body: UpdateApiKeyBodySchema,
    responses: {
      200: UpdateApiKeyResponseSchema,
    },
  },
  delete: {
    method: 'DELETE',
    path: '/api-keys/:id',
    pathParams: DeleteApiKeyParamsSchema,
    responses: {
      200: DeleteApiKeyResponseSchema,
    },
  },
});
