import { factory } from '@/factory';
import {
  AuthenticatorAttestationResponseSchema,
  PublicKeyCredentialCreationOptionsSchema,
} from '@repo/validation';
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi';

export const credentialsPostHandlers = factory.createHandlers(
  describeRoute({
    summary: 'Register a new credential',
    description:
      'Corresponds to navigator.credentials.create(), used for creating a new public key credential as part of the WebAuthn registration ceremony.',
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(AuthenticatorAttestationResponseSchema),
          },
        },
      },
    },
  }),
  zValidator('json', PublicKeyCredentialCreationOptionsSchema),
  async (ctx) => {
    const publicKeyCredentialCreationOptions = ctx.req.valid('json');
  },
);
