import { BytesBufferSourceSchemaCodec } from '../../../../validation/src/browser/BytesBufferSourceSchemaCodec';
import { PublicKeyCredentialDescriptorSchema } from '../../models/credentials/PublicKeyCredentialDescriptorSchema';

export const PublicKeyCredentialDescriptorBrowserSchema =
  PublicKeyCredentialDescriptorSchema.extend({
    id: BytesBufferSourceSchemaCodec,
  });
