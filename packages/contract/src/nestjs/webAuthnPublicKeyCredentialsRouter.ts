import { initContract } from '@ts-rest/core';

import {
  DeleteWebAuthnPublicKeyCredentialParamsSchema,
  DeleteWebAuthnPublicKeyCredentialResponseSchema,
} from '../dto/webauthn-public-key-credentials/DeleteWebAuthnPublicKeyCredential';
import {
  GetWebAuthnPublicKeyCredentialParamsSchema,
  GetWebAuthnPublicKeyCredentialResponseSchema,
} from '../dto/webauthn-public-key-credentials/GetWebAuthnPublicKeyCredential';
import {
  ListWebAuthnPublicKeyCredentialsQuerySchema,
  ListWebAuthnPublicKeyCredentialsResponseSchema,
} from '../dto/webauthn-public-key-credentials/ListWebAuthnPublicKeyCredentials';

const c = initContract();

export const webAuthnPublicKeyCredentialsRouter = c.router({
  list: {
    method: 'GET',
    path: '/webauthn-public-key-credentials',
    query: ListWebAuthnPublicKeyCredentialsQuerySchema,
    responses: ListWebAuthnPublicKeyCredentialsResponseSchema,
    summary: 'List all WebAuthn credentials',
  },
  get: {
    method: 'GET',
    path: '/webauthn-public-key-credentials/:id',
    pathParams: GetWebAuthnPublicKeyCredentialParamsSchema,
    responses: GetWebAuthnPublicKeyCredentialResponseSchema,
    summary: 'Get a single WebAuthn credential',
  },
  delete: {
    method: 'DELETE',
    path: '/webauthn-public-key-credentials/:id',
    pathParams: DeleteWebAuthnPublicKeyCredentialParamsSchema,
    responses: DeleteWebAuthnPublicKeyCredentialResponseSchema,
    summary: 'Delete a WebAuthn credential',
  },
});
