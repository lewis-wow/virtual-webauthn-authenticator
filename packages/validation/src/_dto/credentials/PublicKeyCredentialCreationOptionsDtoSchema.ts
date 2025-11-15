import { PublicKeyCredentialCreationOptionsSchema } from '../../models/credentials/PublicKeyCredentialCreationOptionsSchema';
import { BytesDtoSchema } from '../common/BytesDtoSchema';

export const PublicKeyCredentialCreationOptionsDtoSchema =
  PublicKeyCredentialCreationOptionsSchema.extend({
    challenge: BytesDtoSchema,
  });
