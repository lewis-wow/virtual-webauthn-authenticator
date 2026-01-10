import z from 'zod';

import { BytesSchema } from '../../BytesSchema';
import { VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema } from '../../authenticator/interruption/VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema';

export const VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema =
  z.object({
    virtualAuthenticatorCredentialSelectInterruptionPayload:
      VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema,
    hash: BytesSchema,
  });

export type VirtualAuthenticatorAgentCredentialSelectInterruptionPayload =
  z.infer<
    typeof VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema
  >;
