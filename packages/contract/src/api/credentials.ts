import {
  CreateCredentialRequestBodySchema,
  CreateCredentialResponseSchema,
  GetCredentialRequestQuerySchema,
  GetCredentialResponseSchema,
} from '@repo/validation';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const credentialsRouter = c.router({
  create: {
    method: 'POST',
    path: '/credentials',
    body: CreateCredentialRequestBodySchema,
    responses: {
      200: CreateCredentialResponseSchema,
    },
  },
  get: {
    method: 'GET',
    path: '/credentials',
    query: GetCredentialRequestQuerySchema,
    responses: {
      200: GetCredentialResponseSchema,
    },
  },
});
