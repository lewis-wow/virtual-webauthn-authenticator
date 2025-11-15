import {
  CreateCredentialRequestBodySchema,
  CreateCredentialResponseSchema,
  GetCredentialRequestBodySchema,
  GetCredentialResponseSchema,
} from '@repo/validation';
import { initContract } from '@ts-rest/core';

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
