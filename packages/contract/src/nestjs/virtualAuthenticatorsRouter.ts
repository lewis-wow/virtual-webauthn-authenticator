import { initContract } from '@ts-rest/core';

import {
  CreateVirtualAuthenticatorBodySchema,
  CreateVirtualAuthenticatorResponseSchema,
} from '../dto/virtual-authenticators/CreateVirtualAuthenticator';
import {
  DeleteVirtualAuthenticatorParamsSchema,
  DeleteVirtualAuthenticatorResponseSchema,
} from '../dto/virtual-authenticators/DeleteVirtualAuthenticator';
import {
  ListVirtualAuthenticatorsQuerySchema,
  ListVirtualAuthenticatorsResponseSchema,
} from '../dto/virtual-authenticators/ListVirtualAuthenticators';
import {
  UpdateVirtualAuthenticatorBodySchema,
  UpdateVirtualAuthenticatorParamsSchema,
  UpdateVirtualAuthenticatorResponseSchema,
} from '../dto/virtual-authenticators/UpdateVirtualAuthenticator';

const c = initContract();

export const virtualAuthenticatorsRouter = c.router({
  create: {
    method: 'POST',
    path: '/virtual-authenticators',
    body: CreateVirtualAuthenticatorBodySchema,
    responses: CreateVirtualAuthenticatorResponseSchema,
    summary: 'Create a new virtual authenticator',
  },
  list: {
    method: 'GET',
    path: '/virtual-authenticators',
    query: ListVirtualAuthenticatorsQuerySchema,
    responses: ListVirtualAuthenticatorsResponseSchema,
    summary: 'List all virtual authenticators',
  },
  update: {
    method: 'PUT',
    path: '/virtual-authenticators/:id',
    pathParams: UpdateVirtualAuthenticatorParamsSchema,
    body: UpdateVirtualAuthenticatorBodySchema,
    responses: UpdateVirtualAuthenticatorResponseSchema,
    summary: 'Update a virtual authenticator',
  },
  delete: {
    method: 'DELETE',
    path: '/virtual-authenticators/:id',
    pathParams: DeleteVirtualAuthenticatorParamsSchema,
    responses: DeleteVirtualAuthenticatorResponseSchema,
    summary: 'Delete a virtual authenticator',
  },
});
