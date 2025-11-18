import { initContract } from '@ts-rest/core';

import { DeleteWebAuthnCredentialRequestPathParamsSchema } from '../validation/webauthn-credentials/delete/DeleteWebAuthnCredentialRequestPathParamsSchema';
import { DeleteWebAuthnCredentialResponseSchema } from '../validation/webauthn-credentials/delete/DeleteWebAuthnCredentialResponseSchema';
import { GetWebAuthnCredentialRequestPathParamsSchema } from '../validation/webauthn-credentials/get/GetWebAuthnCredentialRequestPathParamsSchema';
import { GetWebAuthnCredentialResponseSchema } from '../validation/webauthn-credentials/get/GetWebAuthnCredentialResponseSchema';
import { ListWebAuthnCredentialsResponseSchema } from '../validation/webauthn-credentials/list/ListWebAuthnCredentialsResponseSchema';

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
