import { PublicKeyCredentialDescriptorSchema } from '../../models/credentials/PublicKeyCredentialDescriptorSchema';
import { BytesBufferSourceSchemaCodec } from '../BytesBufferSourceSchemaCodec';

export const PublicKeyCredentialDescriptorBrowserSchema =
  PublicKeyCredentialDescriptorSchema.extend({
    id: BytesBufferSourceSchemaCodec,
  });
