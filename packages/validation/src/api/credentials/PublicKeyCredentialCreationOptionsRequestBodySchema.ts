import { PublicKeyCredentialCreationOptionsSchema } from '../../credentials/PublicKeyCredentialCreationOptionsSchema';

export const PublicKeyCredentialCreationOptionsRequestBodySchema =
  PublicKeyCredentialCreationOptionsSchema.omit({
    /**
     * User is infered from token.
     */
    user: true,
  });
