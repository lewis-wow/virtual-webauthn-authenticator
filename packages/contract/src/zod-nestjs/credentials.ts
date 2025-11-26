import { initContract } from '@ts-rest/core';

import { CreateCredentialRequestBodySchema } from '../zod-validation/credentials/create/CreateCredentialRequestBodySchema';
import { CreateCredentialResponseSchema } from '../zod-validation/credentials/create/CreateCredentialResponseSchema';
import { GetCredentialRequestBodySchema } from '../zod-validation/credentials/get/GetCredentialRequestBodySchema';
import { GetCredentialResponseSchema } from '../zod-validation/credentials/get/GetCredentialResponseSchema';

const c = initContract();

export const credentialsRouter = c.router({
  create: {
    method: 'POST',
    path: '/credentials/create',
    body: CreateCredentialRequestBodySchema,
    responses: {
      200: CreateCredentialResponseSchema,
    },
    summary: 'Create a new credential',
  },
  get: {
    method: 'POST',
    path: '/credentials/get',
    body: GetCredentialRequestBodySchema,
    responses: {
      200: GetCredentialResponseSchema,
    },
    summary: 'Get a credential',
  },
});
