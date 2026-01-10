import z from 'zod';

import { BytesSchema } from '../../BytesSchema';
import { ApplicablePublicKeyCredentialSchema } from '../../spec/ApplicablePublicKeyCredentialSchema';

export const VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema =
  z.object({
    hash: BytesSchema,
    credentialOptions: z.array(ApplicablePublicKeyCredentialSchema),
  });

export type VirtualAuthenticatorCredentialSelectInterruptionPayload = z.infer<
  typeof VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema
>;
