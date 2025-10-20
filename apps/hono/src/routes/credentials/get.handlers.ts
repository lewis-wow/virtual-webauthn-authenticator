import { factory } from '@/factory';
import {
  AuthenticatorAssertionResponseSchema,
  PublicKeyCredentialRequestOptionsSchema,
} from '@repo/validation';
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi';

export const credentialsGetHandlers = factory.createHandlers(
  describeRoute({
    summary: 'Authenticate with a credential',
    description:
      'Corresponds to navigator.credentials.get(), used for generating an assertion to authenticate a user as part of the WebAuthn authentication ceremony.',
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(AuthenticatorAssertionResponseSchema),
          },
        },
      },
    },
  }),
  zValidator('query', PublicKeyCredentialRequestOptionsSchema),
  async (ctx) => {
    const publicKeyCredentialRequestOptions = ctx.req.valid('query');
  },
);
