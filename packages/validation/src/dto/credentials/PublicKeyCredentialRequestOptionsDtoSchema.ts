import z from 'zod';

import { PublicKeyCredentialRequestOptionsSchema } from '../../models/credentials/PublicKeyCredentialRequestOptionsSchema';
import { ChallengeDtoSchema } from './ChallengeDtoSchema';
import { PublicKeyCredentialDescriptorDtoSchema } from './PublicKeyCredentialDescriptorDtoSchema';

export const PublicKeyCredentialRequestOptionsDtoSchema =
  PublicKeyCredentialRequestOptionsSchema.extend({
    challenge: ChallengeDtoSchema,
    allowCredentials: z
      .array(PublicKeyCredentialDescriptorDtoSchema)
      .optional(),
  });
