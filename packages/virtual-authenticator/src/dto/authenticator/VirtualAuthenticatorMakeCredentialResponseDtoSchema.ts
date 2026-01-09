import z from 'zod';

import { EnvelopeStatus } from '../../enums/envelope/EnvelopeStatus';
import { EnvelopeSuccessResponseSchema } from '../../validation/envelope/EnvelopeSuccessResponseSchema';
import { AuthenticatorMakeCredentialResponseDtoSchema } from './AuthenticatorMakeCredentialResponseDtoSchema';

export const VirtualAuthenticatorMakeCredentialResponseDtoSchema =
  z.discriminatedUnion('status', [
    EnvelopeSuccessResponseSchema.extend({
      status: z.literal(EnvelopeStatus.SUCCESS),
      payload: AuthenticatorMakeCredentialResponseDtoSchema,
    }),
  ]);
