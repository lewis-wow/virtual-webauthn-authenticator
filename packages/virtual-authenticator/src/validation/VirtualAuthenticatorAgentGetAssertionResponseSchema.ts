import z from 'zod';

import { EnvelopeResponseControlReason } from '../enums/envelope/EnvelopeResponseControlReason';
import { EnvelopeStatus } from '../enums/envelope/EnvelopeStatus';
import { PublicKeyCredentialSchema } from './PublicKeyCredentialSchema';
import { EnvelopeResponseControlSchema } from './envelope/EnvelopeResponseControlSchema';
import { EnvelopeResponseSchema } from './envelope/EnvelopeResponseSchema';
import { EnvelopeSuccessResponseSchema } from './envelope/EnvelopeSuccessResponseSchema';

export const VirtualAuthenticatorAgentGetAssertionResponseSchema =
  z.discriminatedUnion('status', [
    EnvelopeSuccessResponseSchema.extend({
      status: z.literal(EnvelopeStatus.SUCCESS),
      payload: PublicKeyCredentialSchema,
    }),
    EnvelopeResponseSchema.extend({
      status: z.literal(EnvelopeStatus.INTERACTION_REQUIRED),
      control: EnvelopeResponseControlSchema.extend({
        reason: z.literal(EnvelopeResponseControlReason.CREDENTIAL_SELECT),
        stateToken: z.string(),
      }),
    }),
  ]);

export type VirtualAuthenticatorAgentGetAssertionResponse = z.infer<
  typeof VirtualAuthenticatorAgentGetAssertionResponseSchema
>;
