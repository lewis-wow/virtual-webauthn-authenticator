import { initContract } from '@ts-rest/core';

import {
  CreatePublicKeyCredentialBodySchema,
  CreatePublicKeyCredentialResponseSchema,
} from '../dto/credentials/CreatePublicKeyCredential';
import {
  CreatePublicKeyAssertionBodySchema,
  CreatePublicKeyAssertionResponseSchema,
} from '../dto/credentials/CreatePublicKeyAssertion';
import {
  DeletePublicKeyCredentialParamsSchema,
  DeletePublicKeyCredentialResponseSchema,
} from '../dto/webauthn-public-key-credentials/DeletePublicKeyCredential';
import {
  GetPublicKeyCredentialParamsSchema,
  GetPublicKeyCredentialResponseSchema,
} from '../dto/webauthn-public-key-credentials/GetPublicKeyCredential';
import {
  ListPublicKeyCredentialsQuerySchema,
  ListPublicKeyCredentialsResponseSchema,
} from '../dto/webauthn-public-key-credentials/ListPublicKeyCredentials';

const c = initContract();

export const credentialsRouter = c.router({
  create: {
    method: 'POST',
    path: '/public-key-credentials',
    body: CreatePublicKeyCredentialBodySchema,
    responses: CreatePublicKeyCredentialResponseSchema,
    summary: 'Create a new public key credential',
  },
  assertion: {
    method: 'POST',
    path: '/assertions',
    body: CreatePublicKeyAssertionBodySchema,
    responses: CreatePublicKeyAssertionResponseSchema,
    summary: 'Create a new assertion',
  },
  list: {
    method: 'GET',
    path: '/public-key-credentials',
    query: ListPublicKeyCredentialsQuerySchema,
    responses: ListPublicKeyCredentialsResponseSchema,
    summary: 'List all WebAuthn public key credentials',
  },
  get: {
    method: 'GET',
    path: '/public-key-credentials/:id',
    pathParams: GetPublicKeyCredentialParamsSchema,
    responses: GetPublicKeyCredentialResponseSchema,
    summary: 'Get a single WebAuthn public key credential',
  },
  delete: {
    method: 'DELETE',
    path: '/public-key-credentials/:id',
    pathParams: DeletePublicKeyCredentialParamsSchema,
    responses: DeletePublicKeyCredentialResponseSchema,
    summary: 'Delete a WebAuthn public key credential',
  },
});
