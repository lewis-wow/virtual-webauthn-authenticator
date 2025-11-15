import { PublicKeyCredentialRequestOptionsSchema } from '../../models/credentials/PublicKeyCredentialRequestOptionsSchema';
import { ChallengeDtoSchema } from './ChallengeDtoSchema';

export const PublicKeyCredentialRequestOptionsDtoSchema =
  PublicKeyCredentialRequestOptionsSchema.extend({
    challenge: ChallengeDtoSchema,
  });
