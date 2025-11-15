import { PublicKeyCredentialCreationOptionsDtoSchema } from '../PublicKeyCredentialCreationOptionsDtoSchema';

export const CreateCredentialRequestBodySchema =
  PublicKeyCredentialCreationOptionsDtoSchema.omit({
    /**
     * User is infered from token.
     */
    user: true,
  });
