import { initContract } from '@ts-rest/core';

import {
  CreateCredentialBodySchema,
  CreateCredentialResponseSchema,
} from '../dto/credentials/CreateCredential';
import {
  GetCredentialBodySchema,
  GetCredentialResponseSchema,
} from '../dto/credentials/GetCredential';

const c = initContract();

export const credentialsRouter = c.router({
  create: {
    method: 'POST',
    path: '/credentials/create',
    body: CreateCredentialBodySchema,
    responses: CreateCredentialResponseSchema,
    summary: 'Create a new credential',
  },
  get: {
    method: 'POST',
    path: '/credentials/get',
    body: GetCredentialBodySchema,
    responses: GetCredentialResponseSchema,
    summary: 'Get a credential',
  },
});
