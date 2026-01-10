import { BytesSchemaCodec } from '@repo/core/zod-validation';

import { VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema } from '../../validation';

export const VirtualAuthenticatorCredentialSelectInterruptionPayloadDtoSchema =
  VirtualAuthenticatorCredentialSelectInterruptionPayloadSchema.extend({
    hash: BytesSchemaCodec,
  });
