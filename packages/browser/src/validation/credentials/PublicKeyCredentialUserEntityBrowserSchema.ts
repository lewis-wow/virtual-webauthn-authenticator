import { BytesBufferSourceSchemaCodec } from '../../../../validation/src/browser/BytesBufferSourceSchemaCodec';
import { PublicKeyCredentialUserEntitySchema } from '../../models/credentials/PublicKeyCredentialUserEntitySchema';

export const PublicKeyCredentialUserEntityBrowserSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesBufferSourceSchemaCodec,
  });
