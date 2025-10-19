import {
  AuthenticatorAssertionResponseSchema,
  AuthenticatorAttestationResponseSchema,
  PublicKeyCredentialCreationOptionsSchema,
  PublicKeyCredentialRequestOptionsSchema,
} from '@repo/validation';
import type { ZodOpenApiPathItemObject } from 'zod-openapi';

export default {
  get: {
    description:
      'Corresponds to navigator.credentials.get(), used for generating an assertion to authenticate a user as part of the WebAuthn authentication ceremony.',
    requestParams: {
      query: PublicKeyCredentialRequestOptionsSchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: AuthenticatorAssertionResponseSchema,
          },
        },
      },
    },
  },
  post: {
    description:
      'Corresponds to navigator.credentials.create(), used for creating a new public key credential as part of the WebAuthn registration ceremony.',
    requestBody: {
      content: {
        'application/json': {
          schema: PublicKeyCredentialCreationOptionsSchema,
        },
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: AuthenticatorAttestationResponseSchema,
          },
        },
      },
    },
  },
} satisfies ZodOpenApiPathItemObject;
