import z from 'zod';

import { EnvelopeStatus } from '../../enums/envelope/EnvelopeStatus';
import { EnvelopeSuccessResponseSchema } from '../../validation/envelope/EnvelopeSuccessResponseSchema';
import { PublicKeyCredentialDtoSchema } from '../spec/PublicKeyCredentialDtoSchema';

export const VirtualAuthenticatorAgentCreateCredentialResponseDtoSchema =
  z.discriminatedUnion('status', [
    EnvelopeSuccessResponseSchema.extend({
      status: z.literal(EnvelopeStatus.SUCCESS),
      payload: PublicKeyCredentialDtoSchema,
    }),
  ]);
