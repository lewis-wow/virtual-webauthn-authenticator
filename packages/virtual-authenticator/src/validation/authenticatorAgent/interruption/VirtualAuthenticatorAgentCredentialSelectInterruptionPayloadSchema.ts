import z from 'zod';

import { VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema } from '../../authenticator/interruption/VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema';

export const VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema =
  z.object({
    virtualAuthenticatorCredentialSelectInterruptionPayload:
      VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema,
    hash: z.string(),
  });

export type VirtualAuthenticatorAgentCredentialSelectInterruptionPayload =
  z.infer<
    typeof VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema
  >;
