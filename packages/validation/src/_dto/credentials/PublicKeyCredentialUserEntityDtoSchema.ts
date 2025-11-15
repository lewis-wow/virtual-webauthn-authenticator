import { PublicKeyCredentialUserEntitySchema } from '../../models/credentials/PublicKeyCredentialUserEntitySchema';
import { BytesDtoSchema } from '../common/BytesDtoSchema';

export const PublicKeyCredentialUserEntityDtoSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesDtoSchema,
  });
