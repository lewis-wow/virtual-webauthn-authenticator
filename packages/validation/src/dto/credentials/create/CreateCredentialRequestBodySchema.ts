import z from 'zod';

import { PublicKeyCredentialCreationOptionsDtoSchema } from '../PublicKeyCredentialCreationOptionsDtoSchema';

export const CreateCredentialRequestBodySchema = z.object({
  publicKeyCredentialCreationOptions:
    PublicKeyCredentialCreationOptionsDtoSchema.omit({
      /**
       * User is infered from token.
       */
      user: true,
    }),
  meta: z.object({
    origin: z.url(),
  }),
});
