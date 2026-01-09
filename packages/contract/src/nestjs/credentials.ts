import { HttpStatusCode } from '@repo/http';
import {
  AuthenticatorAgentGetAssertionResponseDtoSchema,
  CredentialSelectExceptionPayloadDtoSchema,
} from '@repo/virtual-authenticator/dto';
import { initContract } from '@ts-rest/core';

import {
  CreateCredentialBodySchema,
  CreateCredentialResponseSchema,
} from '../dto/credentials/CreateCredential';
import { GetCredentialBodySchema } from '../dto/credentials/GetCredential';

const c = initContract();

export const credentialsRouter = c.router({
  create: {
    method: 'POST',
    path: '/credentials/create',
    body: CreateCredentialBodySchema,
    responses: {
      200: CreateCredentialResponseSchema,
    },
    summary: 'Create a new credential',
  },
  get: {
    method: 'POST',
    path: '/credentials/get',
    body: GetCredentialBodySchema,
    responses: {
      [HttpStatusCode.OK]: AuthenticatorAgentGetAssertionResponseDtoSchema,
      [HttpStatusCode.PRECONDITION_REQUIRED]:
        CredentialSelectExceptionPayloadDtoSchema,
    },
    summary: 'Get a credential',
  },
});
