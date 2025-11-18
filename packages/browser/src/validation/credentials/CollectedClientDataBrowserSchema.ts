import { CollectedClientDataSchema } from '@repo/virtual-authenticator/validation';

import { BytesBufferSourceSchemaCodec } from '../BytesBufferSourceSchemaCodec';

export const CollectedClientDataBrowserSchema =
  CollectedClientDataSchema.extend({
    challenge: BytesBufferSourceSchemaCodec,
  });
