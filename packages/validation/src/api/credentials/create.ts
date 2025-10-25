import {
  PublicKeyCredentialCreationOptionsSchema,
  PublicKeyCredentialSchema,
} from '../../models';

export const CreateCredentialRequestBodySchema =
  PublicKeyCredentialCreationOptionsSchema.omit({
    /**
     * User is infered from token.
     */
    user: true,
  });

export const CreateCredentialResponseSchema = PublicKeyCredentialSchema;
