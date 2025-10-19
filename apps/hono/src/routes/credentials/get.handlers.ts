import { factory } from '@/factory';
import {
  AuthenticatorAssertionResponseSchema,
  PublicKeyCredentialRequestOptionsSchema,
} from '@repo/validation';
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi';

export const credentialsGetHandlers = factory.createHandlers(
  describeRoute({
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
