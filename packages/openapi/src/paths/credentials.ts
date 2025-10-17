import {
  AuthenticatorAssertionResponseSchema,
  AuthenticatorAttestationResponseSchema,
} from '@repo/validation';
import type { ZodOpenApiPathItemObject } from 'zod-openapi';

export const credentialsPath: ZodOpenApiPathItemObject = {
  get: {
    summary: 'Authenticate with a credential',
    description:
      'Corresponds to navigator.credentials.get(), used for generating an assertion to authenticate a user as part of the WebAuthn authentication ceremony.',
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
    summary: 'Register a new credential',
    description:
      'Corresponds to navigator.credentials.create(), used for creating a new public key credential as part of the WebAuthn registration ceremony.',
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
};
