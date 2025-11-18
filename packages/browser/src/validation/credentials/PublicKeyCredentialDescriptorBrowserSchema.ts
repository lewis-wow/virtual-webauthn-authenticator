import { PublicKeyCredentialDescriptorSchema } from '@repo/virtual-authenticator/validation';

import { BytesBufferSourceSchemaCodec } from '../BytesBufferSourceSchemaCodec';

export const PublicKeyCredentialDescriptorBrowserSchema =
  PublicKeyCredentialDescriptorSchema.extend({
    id: BytesBufferSourceSchemaCodec,
  });
