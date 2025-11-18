import { PublicKeyCredentialRequestOptionsSchema } from '@repo/virtual-authenticator/validation';
import z from 'zod';

import { ChallengeDtoSchema } from './ChallengeDtoSchema';
import { PublicKeyCredentialDescriptorDtoSchema } from './PublicKeyCredentialDescriptorDtoSchema';

export const PublicKeyCredentialRequestOptionsDtoSchema =
  PublicKeyCredentialRequestOptionsSchema.extend({
    challenge: ChallengeDtoSchema,
    allowCredentials: z
      .array(PublicKeyCredentialDescriptorDtoSchema)
      .optional(),
  });
