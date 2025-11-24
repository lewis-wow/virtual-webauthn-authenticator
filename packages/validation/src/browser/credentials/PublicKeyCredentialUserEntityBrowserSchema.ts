import { PublicKeyCredentialUserEntitySchema } from '../../models/credentials/PublicKeyCredentialUserEntitySchema';
import { BytesBufferSourceSchemaCodec } from '../BytesBufferSourceSchemaCodec';

export const PublicKeyCredentialUserEntityBrowserSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesBufferSourceSchemaCodec,
  });
