import { PublicKeyCredentialUserEntitySchema } from '../../models/credentials/PublicKeyCredentialUserEntitySchema';
import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const PublicKeyCredentialUserEntityDtoSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesSchemaCodec,
  });
