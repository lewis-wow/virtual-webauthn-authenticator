import { initContract } from '@ts-rest/core';

import { CreateCredentialRequestBodySchema } from '../validation/credentials/create/CreateCredentialRequestBodySchema';
import { CreateCredentialResponseSchema } from '../validation/credentials/create/CreateCredentialResponseSchema';
import { GetCredentialRequestBodySchema } from '../validation/credentials/get/GetCredentialRequestBodySchema';
import { GetCredentialResponseSchema } from '../validation/credentials/get/GetCredentialResponseSchema';

const c = initContract();

export const credentialsRouter = c.router({
  create: {
    method: 'POST',
    path: '/credentials/create',
    body: CreateCredentialRequestBodySchema,
    responses: {
      200: CreateCredentialResponseSchema,
    },
  },
  get: {
    method: 'POST',
    path: '/credentials/get',
    body: GetCredentialRequestBodySchema,
    responses: {
      200: GetCredentialResponseSchema,
    },
  },
});
