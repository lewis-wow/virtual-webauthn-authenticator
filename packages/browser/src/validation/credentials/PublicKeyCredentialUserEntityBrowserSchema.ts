import { PublicKeyCredentialUserEntitySchema } from '@repo/virtual-authenticator/validation';

import { BytesBufferSourceSchemaCodec } from '../BytesBufferSourceSchemaCodec';

export const PublicKeyCredentialUserEntityBrowserSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesBufferSourceSchemaCodec,
  });
