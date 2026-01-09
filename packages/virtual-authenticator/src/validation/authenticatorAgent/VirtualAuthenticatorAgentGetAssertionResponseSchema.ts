import z from 'zod';

import { EnvelopeStatus } from '../../enums/envelope/EnvelopeStatus';
import { EnvelopeResponseSchema } from '../envelope/EnvelopeResponseSchema';
import { EnvelopeSuccessResponseSchema } from '../envelope/EnvelopeSuccessResponseSchema';
import { PublicKeyCredentialSchema } from '../spec/PublicKeyCredentialSchema';
import { VirtualAuthenticatorAgentCredentialSelectStateSchema } from './state/VirtualAuthenticatorAgentCredentialSelectStateSchema';

export const VirtualAuthenticatorAgentGetAssertionResponseSchema =
  z.discriminatedUnion('status', [
    EnvelopeSuccessResponseSchema.extend({
      status: z.literal(EnvelopeStatus.SUCCESS),
      payload: PublicKeyCredentialSchema,
    }),
    EnvelopeResponseSchema.extend({
      status: z.literal(EnvelopeStatus.INTERACTION_REQUIRED),
      state: VirtualAuthenticatorAgentCredentialSelectStateSchema,
    }),
  ]);

export type VirtualAuthenticatorAgentGetAssertionResponse = z.infer<
  typeof VirtualAuthenticatorAgentGetAssertionResponseSchema
>;
