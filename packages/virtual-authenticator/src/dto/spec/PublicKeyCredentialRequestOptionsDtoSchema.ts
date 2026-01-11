import z from 'zod';

import { PublicKeyCredentialRequestOptionsSchema } from '../../validation/spec/PublicKeyCredentialRequestOptionsSchema';
import { ChallengeDtoSchema } from './ChallengeDtoSchema';
import { PublicKeyCredentialDescriptorDtoSchema } from './PublicKeyCredentialDescriptorDtoSchema';

export const PublicKeyCredentialRequestOptionsDtoSchema =
  PublicKeyCredentialRequestOptionsSchema.extend({
    challenge: ChallengeDtoSchema,
    allowCredentials: z
      .array(PublicKeyCredentialDescriptorDtoSchema)
      .optional(),
  });
