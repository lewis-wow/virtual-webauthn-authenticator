import { PublicKeyCredentialCreationOptionsSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

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
