import z from 'zod';

import { EnvelopeResponseControlReason } from '../../enums/envelope/EnvelopeResponseControlReason';
import { EnvelopeStatus } from '../../enums/envelope/EnvelopeStatus';
import { EnvelopeResponseControlSchema } from '../../validation/envelope/EnvelopeResponseControlSchema';
import { EnvelopeResponseSchema } from '../../validation/envelope/EnvelopeResponseSchema';
import { EnvelopeSuccessResponseSchema } from '../../validation/envelope/EnvelopeSuccessResponseSchema';
import { PublicKeyCredentialDtoSchema } from '../spec/PublicKeyCredentialDtoSchema';

export const VirtualAuthenticatorAgentGetAssertionResponseDtoSchema =
  z.discriminatedUnion('status', [
    EnvelopeSuccessResponseSchema.extend({
      status: z.literal(EnvelopeStatus.SUCCESS),
      payload: PublicKeyCredentialDtoSchema,
    }),
    EnvelopeResponseSchema.extend({
      status: z.literal(EnvelopeStatus.INTERACTION_REQUIRED),
      control: EnvelopeResponseControlSchema.extend({
        reason: z.literal(EnvelopeResponseControlReason.CREDENTIAL_SELECT),
        stateToken: z.string(),
      }),
    }),
  ]);
