import z from 'zod';

import { EnvelopeStatus } from '../../enums/envelope/EnvelopeStatus';
import { EnvelopeResponseSchema } from '../envelope/EnvelopeResponseSchema';
import { EnvelopeSuccessResponseSchema } from '../envelope/EnvelopeSuccessResponseSchema';
import { AuthenticatorGetAssertionResponseSchema } from './AuthenticatorGetAssertionResponseSchema';
import { VirtualAuthenticatorCredentialSelectStateSchema } from './state/VirtualAuthenticatorCredentialSelectStateSchema';

export const VirtualAuthenticatorGetAssertionResponseSchema =
  z.discriminatedUnion('status', [
    EnvelopeSuccessResponseSchema.extend({
      status: z.literal(EnvelopeStatus.SUCCESS),
      payload: AuthenticatorGetAssertionResponseSchema,
    }),
    EnvelopeResponseSchema.extend({
      status: z.literal(EnvelopeStatus.INTERACTION_REQUIRED),
      state: VirtualAuthenticatorCredentialSelectStateSchema,
    }),
  ]);

export type VirtualAuthenticatorGetAssertionResponse = z.infer<
  typeof VirtualAuthenticatorGetAssertionResponseSchema
>;
