import z from 'zod';

import { EnvelopeStatus } from '../../enums/envelope/EnvelopeStatus';
import { EnvelopeSuccessResponseSchema } from '../envelope/EnvelopeSuccessResponseSchema';
import { AuthenticatorMakeCredentialResponseSchema } from './AuthenticatorMakeCredentialResponseSchema';

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
