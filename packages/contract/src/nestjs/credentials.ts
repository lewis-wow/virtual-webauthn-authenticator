import { initContract } from '@ts-rest/core';
import { Schema } from 'effect';

import { CreateCredentialRequestBodySchema } from '../validation/credentials/create/CreateCredentialRequestBodySchema';
import { CreateCredentialResponseSchema } from '../validation/credentials/create/CreateCredentialResponseSchema';
import { GetCredentialRequestBodySchema } from '../validation/credentials/get/GetCredentialRequestBodySchema';
import { GetCredentialResponseSchema } from '../validation/credentials/get/GetCredentialResponseSchema';

const c = initContract();

export const credentialsRouter = c.router({
  create: {
    method: 'POST',
    path: '/credentials/create',
    body: Schema.standardSchemaV1(CreateCredentialRequestBodySchema),
    responses: {
      200: Schema.standardSchemaV1(CreateCredentialResponseSchema),
    },
  },
  get: {
    method: 'POST',
    path: '/credentials/get',
    body: Schema.standardSchemaV1(GetCredentialRequestBodySchema),
    responses: {
      200: Schema.standardSchemaV1(GetCredentialResponseSchema),
    },
  },
});
