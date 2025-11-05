import {
  DeleteWebAuthnCredentialRequestPathParamsSchema,
  DeleteWebAuthnCredentialResponseSchema,
  GetWebAuthnCredentialRequestPathParamsSchema,
  GetWebAuthnCredentialResponseSchema,
  ListWebAuthnCredentialsResponseSchema,
} from '@repo/validation';
import { initContract } from '@ts-rest/core';

const c = initContract();

export const webAuthnCredentialsRouter = c.router({
  list: {
    method: 'GET',
    path: '/webauthn-credentials',
    responses: {
      200: ListWebAuthnCredentialsResponseSchema,
    },
  },
  get: {
    method: 'GET',
    path: '/webauthn-credentials/:id',
    pathParams: GetWebAuthnCredentialRequestPathParamsSchema,
    responses: {
      200: GetWebAuthnCredentialResponseSchema,
    },
  },
  delete: {
    method: 'DELETE',
    path: '/webauthn-credentials/:id',
    pathParams: DeleteWebAuthnCredentialRequestPathParamsSchema,
    responses: {
      200: DeleteWebAuthnCredentialResponseSchema,
    },
  },
});
