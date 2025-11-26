import { initContract } from '@ts-rest/core';

import { DeleteWebAuthnCredentialRequestPathParamsSchema } from '../zod-validation/webauthn-credentials/delete/DeleteWebAuthnCredentialRequestPathParamsSchema';
import { DeleteWebAuthnCredentialResponseSchema } from '../zod-validation/webauthn-credentials/delete/DeleteWebAuthnCredentialResponseSchema';
import { GetWebAuthnCredentialRequestPathParamsSchema } from '../zod-validation/webauthn-credentials/get/GetWebAuthnCredentialRequestPathParamsSchema';
import { GetWebAuthnCredentialResponseSchema } from '../zod-validation/webauthn-credentials/get/GetWebAuthnCredentialResponseSchema';
import { ListWebAuthnCredentialsResponseSchema } from '../zod-validation/webauthn-credentials/list/ListWebAuthnCredentialsResponseSchema';

const c = initContract();

export const webAuthnCredentialsRouter = c.router({
  list: {
    method: 'GET',
    path: '/webauthn-credentials',
    responses: {
      200: ListWebAuthnCredentialsResponseSchema,
    },
    summary: 'List all WebAuthn credentials',
  },
  get: {
    method: 'GET',
    path: '/webauthn-credentials/:id',
    pathParams: GetWebAuthnCredentialRequestPathParamsSchema,
    responses: {
      200: GetWebAuthnCredentialResponseSchema,
    },
    summary: 'Get a single WebAuthn credential',
  },
  delete: {
    method: 'DELETE',
    path: '/webauthn-credentials/:id',
    pathParams: DeleteWebAuthnCredentialRequestPathParamsSchema,
    responses: {
      200: DeleteWebAuthnCredentialResponseSchema,
    },
    summary: 'Delete a WebAuthn credential',
  },
});
