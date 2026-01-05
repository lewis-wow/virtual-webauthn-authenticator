import { CollectedClientDataSchema } from '@repo/virtual-authenticator/validation';

import { BytesBufferSourceSchemaCodec } from '../codecs/BytesBufferSourceSchemaCodec';

export const CollectedClientDataBrowserSchema =
  CollectedClientDataSchema.extend({
    challenge: BytesBufferSourceSchemaCodec,
  });
