import z from 'zod';

import { EnvelopeStatus } from '../../enums/envelope/EnvelopeStatus';
import { EnvelopeSuccessResponseSchema } from '../envelope/EnvelopeSuccessResponseSchema';
import { PublicKeyCredentialSchema } from '../spec/PublicKeyCredentialSchema';

export const VirtualAuthenticatorAgentCreateCredentialResponseSchema =
  z.discriminatedUnion('status', [
    EnvelopeSuccessResponseSchema.extend({
      status: z.literal(EnvelopeStatus.SUCCESS),
      payload: PublicKeyCredentialSchema,
    }),
  ]);

export type VirtualAuthenticatorAgentCreateCredentialResponse = z.infer<
  typeof VirtualAuthenticatorAgentCreateCredentialResponseSchema
>;
