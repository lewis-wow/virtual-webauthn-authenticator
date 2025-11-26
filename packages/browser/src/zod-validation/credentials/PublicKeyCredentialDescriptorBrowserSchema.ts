import { PublicKeyCredentialDescriptorSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesBufferSourceSchemaCodec } from '../codecs/BytesBufferSourceSchemaCodec';

export const PublicKeyCredentialDescriptorBrowserSchema =
  PublicKeyCredentialDescriptorSchema.extend({
    id: BytesBufferSourceSchemaCodec,
  });
