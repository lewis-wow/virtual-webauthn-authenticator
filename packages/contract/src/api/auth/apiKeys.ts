import { initContract } from '@ts-rest/core';

import { CreateApiKeyRequestBodySchema } from '../../validation/auth/api-keys/create/CreateApiKeyRequestBodySchema';
import { CreateApiKeyResponseSchema } from '../../validation/auth/api-keys/create/CreateApiKeyResponseSchema';
import { DeleteApiKeyRequestParamSchema } from '../../validation/auth/api-keys/delete/DeleteApiKeyRequestParamSchema';
import { DeleteApiKeyResponseSchema } from '../../validation/auth/api-keys/delete/DeleteApiKeyResponseSchema';
import { GetTokenApiKeysResponseSchema } from '../../validation/auth/api-keys/get-token/GetTokenApiKeysResponseSchema';
import { GetApiKeyRequestParamSchema } from '../../validation/auth/api-keys/get/GetApiKeyRequestParamSchema';
import { GetApiKeyResponseSchema } from '../../validation/auth/api-keys/get/GetApiKeyResponseSchema';
import { ListApiKeysResponseSchema } from '../../validation/auth/api-keys/list/ListApiKeysResponseSchema';
import { UpdateApiKeyRequestBodySchema } from '../../validation/auth/api-keys/update/UpdateApiKeyRequestBodySchema';
import { UpdateApiKeyRequestParamSchema } from '../../validation/auth/api-keys/update/UpdateApiKeyRequestParamSchema';
import { UpdateApiKeyResponseSchema } from '../../validation/auth/api-keys/update/UpdateApiKeyResponseSchema';

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
