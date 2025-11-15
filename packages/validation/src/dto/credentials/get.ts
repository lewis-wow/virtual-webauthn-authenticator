import z from 'zod';

import { PublicKeyCredentialDtoSchema } from '../../_dto/credentials/PublicKeyCredentialDtoSchema';
import { PublicKeyCredentialRequestOptionsDtoSchema } from '../../_dto/credentials/PublicKeyCredentialRequestOptionsDtoSchema';

export const GetCredentialRequestBodySchema =
  PublicKeyCredentialRequestOptionsDtoSchema.extend({
    rpId: z.string(),
  });

export const GetCredentialResponseSchema = PublicKeyCredentialDtoSchema;
