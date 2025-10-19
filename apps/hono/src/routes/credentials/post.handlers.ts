import { factory } from '@/factory';
import {
  AuthenticatorAttestationResponseSchema,
  PublicKeyCredentialCreationOptionsSchema,
} from '@repo/validation';
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi';

export const credentialsPostHandlers = factory.createHandlers(
  describeRoute({
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
