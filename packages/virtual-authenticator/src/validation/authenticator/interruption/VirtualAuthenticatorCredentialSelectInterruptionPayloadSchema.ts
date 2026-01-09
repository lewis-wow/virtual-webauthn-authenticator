import z from 'zod';

import { ApplicablePublicKeyCredentialSchema } from '../../spec/ApplicablePublicKeyCredentialSchema';

export const VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema =
  z.object({
    credentialOptions: z.array(ApplicablePublicKeyCredentialSchema),
  });

export type VirtualAuthenticatorCredentialSelectInterruptionPayload = z.infer<
  typeof VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema
>;
