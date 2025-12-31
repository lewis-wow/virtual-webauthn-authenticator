import { initContract } from '@ts-rest/core';

import {
  DeleteWebAuthnCredentialParamsSchema,
  DeleteWebAuthnCredentialResponseSchema,
} from '../dto/webauthn-credentials/DeleteWebAuthnCredential';
import {
  GetWebAuthnCredentialParamsSchema,
  GetWebAuthnCredentialResponseSchema,
} from '../dto/webauthn-credentials/GetWebAuthnCredential';
import {
  ListWebAuthnCredentialsQuerySchema,
  ListWebAuthnCredentialsResponseSchema,
} from '../dto/webauthn-credentials/ListWebAuthnCredentials';

const c = initContract();

export const webAuthnPublicKeyCredentialsRouter = c.router({
  list: {
    method: 'GET',
    path: '/webauthn-public-key-credentials',
    query: ListWebAuthnCredentialsQuerySchema,
    responses: {
      200: ListWebAuthnCredentialsResponseSchema,
    },
    summary: 'List all WebAuthn credentials',
  },
  get: {
    method: 'GET',
    path: '/webauthn-public-key-credentials/:id',
    pathParams: GetWebAuthnCredentialParamsSchema,
    responses: {
      200: GetWebAuthnCredentialResponseSchema,
    },
    summary: 'Get a single WebAuthn credential',
  },
  delete: {
    method: 'DELETE',
    path: '/webauthn-public-key-credentials/:id',
    pathParams: DeleteWebAuthnCredentialParamsSchema,
    responses: {
      200: DeleteWebAuthnCredentialResponseSchema,
    },
    summary: 'Delete a WebAuthn credential',
  },
});
