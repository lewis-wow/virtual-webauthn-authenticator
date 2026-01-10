import { BytesSchemaCodec } from '@repo/core/zod-validation';

import { VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema } from '../../validation/authenticatorAgent/interruption/VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema';
import { VirtualAuthenticatorCredentialSelectInterruptionPayloadDtoSchema } from '../authenticator/VirtualAuthenticatorCredentialSelectInterruptionPayloadDtoSchema';

export const VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadDtoSchema =
  VirtualAuthenticatorAgentCredentialSelectInterruptionPayloadSchema.extend({
    virtualAuthenticatorCredentialSelectInterruptionPayload:
      VirtualAuthenticatorCredentialSelectInterruptionPayloadDtoSchema,
    hash: BytesSchemaCodec,
  });
