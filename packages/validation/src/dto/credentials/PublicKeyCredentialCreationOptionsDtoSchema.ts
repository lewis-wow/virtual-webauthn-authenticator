import { PublicKeyCredentialCreationOptionsSchema } from '../../models/credentials/PublicKeyCredentialCreationOptionsSchema';
import { ChallengeDtoSchema } from './ChallengeDtoSchema';

export const PublicKeyCredentialCreationOptionsDtoSchema =
  PublicKeyCredentialCreationOptionsSchema.extend({
    challenge: ChallengeDtoSchema,
  });
