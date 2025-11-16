import z from 'zod';

import { PublicKeyCredentialRequestOptionsDtoSchema } from '../PublicKeyCredentialRequestOptionsDtoSchema';

export const GetCredentialRequestBodySchema = z.object({
  publicKeyCredentialRequestOptions:
    PublicKeyCredentialRequestOptionsDtoSchema.extend({
      rpId: z.string(),
    }),
  meta: z.object({
    origin: z.url(),
  }),
});
