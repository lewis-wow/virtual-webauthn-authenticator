import {
  AuthenticatorAssertionResponseSchema,
  AuthenticatorAttestationResponseSchema,
} from '@repo/validation';
import type { ZodOpenApiPathItemObject } from 'zod-openapi';

export const credentialsPath: ZodOpenApiPathItemObject = {
  get: {
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
