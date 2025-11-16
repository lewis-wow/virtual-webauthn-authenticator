import z from 'zod';

import { PublicKeyCredentialCreationOptionsSchema } from '../../models/credentials/PublicKeyCredentialCreationOptionsSchema';
import { ChallengeDtoSchema } from './ChallengeDtoSchema';
import { PublicKeyCredentialDescriptorDtoSchema } from './PublicKeyCredentialDescriptorDtoSchema';
import { PublicKeyCredentialUserEntityDtoSchema } from './PublicKeyCredentialUserEntityDtoSchema';

export const PublicKeyCredentialCreationOptionsDtoSchema =
  PublicKeyCredentialCreationOptionsSchema.extend({
    challenge: ChallengeDtoSchema,
    user: PublicKeyCredentialUserEntityDtoSchema,
    excludeCredentials: z
      .array(PublicKeyCredentialDescriptorDtoSchema)
      .optional(),
  });
