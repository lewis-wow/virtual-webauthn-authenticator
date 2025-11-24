import { PublicKeyCredentialUserEntitySchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesBufferSourceSchemaCodec } from '../codecs/BytesBufferSourceSchemaCodec';

export const PublicKeyCredentialUserEntityBrowserSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesBufferSourceSchemaCodec,
  });
