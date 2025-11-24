import '@standard-schema/spec';
import { initContract } from '@ts-rest/core';
import { Schema } from 'effect';

import { CreateApiKeyRequestBodySchema } from '../validation/auth/api-keys/create/CreateApiKeyRequestBodySchema';
import { CreateApiKeyResponseSchema } from '../validation/auth/api-keys/create/CreateApiKeyResponseSchema';
import { DeleteApiKeyRequestParamSchema } from '../validation/auth/api-keys/delete/DeleteApiKeyRequestParamSchema';
import { DeleteApiKeyResponseSchema } from '../validation/auth/api-keys/delete/DeleteApiKeyResponseSchema';
import { GetTokenApiKeysResponseSchema } from '../validation/auth/api-keys/get-token/GetTokenApiKeysResponseSchema';
import { GetApiKeyRequestParamSchema } from '../validation/auth/api-keys/get/GetApiKeyRequestParamSchema';
import { GetApiKeyResponseSchema } from '../validation/auth/api-keys/get/GetApiKeyResponseSchema';
import { ListApiKeysResponseSchema } from '../validation/auth/api-keys/list/ListApiKeysResponseSchema';
import { UpdateApiKeyRequestBodySchema } from '../validation/auth/api-keys/update/UpdateApiKeyRequestBodySchema';
import { UpdateApiKeyRequestParamSchema } from '../validation/auth/api-keys/update/UpdateApiKeyRequestParamSchema';
import { UpdateApiKeyResponseSchema } from '../validation/auth/api-keys/update/UpdateApiKeyResponseSchema';

const c = initContract();

export const apiKeysRouter = c.router({
  create: {
    method: 'POST',
    path: '/api-keys',
    body: Schema.standardSchemaV1(CreateApiKeyRequestBodySchema),
    responses: {
      200: Schema.standardSchemaV1(CreateApiKeyResponseSchema),
    },
  },
  list: {
    method: 'GET',
    path: '/api-keys',
    responses: {
      200: Schema.standardSchemaV1(ListApiKeysResponseSchema),
    },
  },
  getToken: {
    method: 'GET',
    path: '/api-keys/token',
    responses: {
      200: Schema.standardSchemaV1(GetTokenApiKeysResponseSchema),
    },
  },
  get: {
    method: 'GET',
    path: '/api-keys/:id',
    pathParams: Schema.standardSchemaV1(GetApiKeyRequestParamSchema),
    responses: {
      200: Schema.standardSchemaV1(GetApiKeyResponseSchema),
    },
  },
  update: {
    method: 'PUT',
    path: '/api-keys/:id',
    pathParams: Schema.standardSchemaV1(UpdateApiKeyRequestParamSchema),
    body: Schema.standardSchemaV1(UpdateApiKeyRequestBodySchema),
    responses: {
      200: Schema.standardSchemaV1(UpdateApiKeyResponseSchema),
    },
  },
  delete: {
    method: 'DELETE',
    path: '/api-keys/:id',
    pathParams: Schema.standardSchemaV1(DeleteApiKeyRequestParamSchema),
    responses: {
      200: Schema.standardSchemaV1(DeleteApiKeyResponseSchema),
    },
  },
});
