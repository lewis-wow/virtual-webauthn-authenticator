import { PublicKeyCredentialRequestOptionsSchema } from '../../models/credentials/PublicKeyCredentialRequestOptionsSchema';
import { BytesDtoSchema } from '../common/BytesDtoSchema';

export const PublicKeyCredentialRequestOptionsDtoSchema =
  PublicKeyCredentialRequestOptionsSchema.extend({
    challenge: BytesDtoSchema,
  });
