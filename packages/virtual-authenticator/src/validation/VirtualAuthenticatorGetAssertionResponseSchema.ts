import z from 'zod';

import { EnvelopeResponseControlReason } from '../enums/envelope/EnvelopeResponseControlReason';
import { EnvelopeStatus } from '../enums/envelope/EnvelopeStatus';
import { AuthenticatorGetAssertionResponseSchema } from './AuthenticatorGetAssertionResponseSchema';
import { EnvelopeResponseControlSchema } from './envelope/EnvelopeResponseControlSchema';
import { EnvelopeResponseSchema } from './envelope/EnvelopeResponseSchema';
import { EnvelopeSuccessResponseSchema } from './envelope/EnvelopeSuccessResponseSchema';

export const VirtualAuthenticatorGetAssertionResponseSchema =
  z.discriminatedUnion('status', [
    EnvelopeSuccessResponseSchema.extend({
      status: z.literal(EnvelopeStatus.SUCCESS),
      payload: AuthenticatorGetAssertionResponseSchema,
    }),
    EnvelopeResponseSchema.extend({
      status: z.literal(EnvelopeStatus.INTERACTION_REQUIRED),
      control: EnvelopeResponseControlSchema.extend({
        reason: z.literal(EnvelopeResponseControlReason.CREDENTIAL_SELECT),
        stateToken: z.string(),
      }),
    }),
  ]);

export type VirtualAuthenticatorGetAssertionResponse = z.infer<
  typeof VirtualAuthenticatorGetAssertionResponseSchema
>;
