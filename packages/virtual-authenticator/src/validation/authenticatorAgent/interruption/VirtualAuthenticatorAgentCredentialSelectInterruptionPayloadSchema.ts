import z from 'zod';

import { VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema } from '../../authenticator/interruption/VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema';

export const VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema =
  z.object({
    virtualAuthenticatorCredentialSelectInterruptionPayload:
      VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema,
    optionsHash: z.string(),
  });

export type VirtualAuthenticatorAgentCredentialSelectInterruptionPayload =
  z.infer<
    typeof VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema
  >;
