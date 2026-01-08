import z from 'zod';

import { EnvelopeStatus } from '../enums/envelope/EnvelopeStatus';
import { PublicKeyCredentialSchema } from './PublicKeyCredentialSchema';
import { EnvelopeSuccessResponseSchema } from './envelope/EnvelopeSuccessResponseSchema';

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
