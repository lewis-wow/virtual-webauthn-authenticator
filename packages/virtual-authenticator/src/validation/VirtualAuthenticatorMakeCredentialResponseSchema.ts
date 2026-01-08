import z from 'zod';

import { EnvelopeStatus } from '../enums/envelope/EnvelopeStatus';
import { AuthenticatorMakeCredentialResponseSchema } from './AuthenticatorMakeCredentialResponseSchema';
import { EnvelopeSuccessResponseSchema } from './envelope/EnvelopeSuccessResponseSchema';

export const VirtualAuthenticatorMakeCredentialResponseSchema =
  z.discriminatedUnion('status', [
    EnvelopeSuccessResponseSchema.extend({
      status: z.literal(EnvelopeStatus.SUCCESS),
      payload: AuthenticatorMakeCredentialResponseSchema,
    }),
  ]);

export type VirtualAuthenticatorMakeCredentialResponse = z.infer<
  typeof VirtualAuthenticatorMakeCredentialResponseSchema
>;
