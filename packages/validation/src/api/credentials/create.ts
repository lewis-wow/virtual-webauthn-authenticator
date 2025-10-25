import { PublicKeyCredentialCreationOptionsSchema } from '../../models/credentials/PublicKeyCredentialCreationOptionsSchema';
import { PublicKeyCredentialSchema } from '../../models/credentials/PublicKeyCredentialSchema';

export const CreateCredentialRequestBodySchema =
  PublicKeyCredentialCreationOptionsSchema.omit({
    /**
     * User is infered from token.
     */
    user: true,
  });

export const CreateCredentialResponseSchema = PublicKeyCredentialSchema;
