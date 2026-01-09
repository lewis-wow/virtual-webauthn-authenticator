import z from 'zod';

import { VirtualAuthenticatorCredentialSelectStateSchema } from '../../authenticator/state/VirtualAuthenticatorCredentialSelectStateSchema';
import { PublicKeyCredentialDescriptorSchema } from '../../spec/PublicKeyCredentialDescriptorSchema';

export const VirtualAuthenticatorAgentCredentialSelectStateSchema = z.object({
  virtualAuthenticatorCredentialSelectExceptionState:
    VirtualAuthenticatorCredentialSelectStateSchema,
  credentialIdFilter: z.array(PublicKeyCredentialDescriptorSchema),
});

export type VirtualAuthenticatorAgentCredentialSelectState = z.infer<
  typeof VirtualAuthenticatorAgentCredentialSelectStateSchema
>;
