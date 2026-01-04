import { PublicKeyCredentialUserEntitySchema } from '@repo/virtual-authenticator/validation';

import { BytesBufferSourceSchemaCodec } from '../codecs/BytesBufferSourceSchemaCodec';

export const PublicKeyCredentialUserEntityBrowserSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesBufferSourceSchemaCodec,
  });
