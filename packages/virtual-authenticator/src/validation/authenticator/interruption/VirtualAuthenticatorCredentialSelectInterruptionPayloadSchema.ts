import z from 'zod';

import { ApplicablePublicKeyCredentialSchema } from '../../spec/ApplicablePublicKeyCredentialSchema';

export const VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema =
  z.object({
    hash: z.string(),
    credentialOptions: z.array(ApplicablePublicKeyCredentialSchema),
  });

export type VirtualAuthenticatorCredentialSelectInterruptionPayload = z.infer<
  typeof VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema
>;
