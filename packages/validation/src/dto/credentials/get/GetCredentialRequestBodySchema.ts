import z from 'zod';

import { PublicKeyCredentialRequestOptionsDtoSchema } from '../PublicKeyCredentialRequestOptionsDtoSchema';

export const GetCredentialRequestBodySchema =
  PublicKeyCredentialRequestOptionsDtoSchema.extend({
    rpId: z.string(),
  });
