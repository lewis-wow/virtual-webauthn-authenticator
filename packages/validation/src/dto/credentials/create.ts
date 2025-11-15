import { PublicKeyCredentialCreationOptionsDtoSchema } from '../../_dto/credentials/PublicKeyCredentialCreationOptionsDtoSchema';
import { PublicKeyCredentialDtoSchema } from '../../_dto/credentials/PublicKeyCredentialDtoSchema';

export const CreateCredentialRequestBodySchema =
  PublicKeyCredentialCreationOptionsDtoSchema.omit({
    /**
     * User is infered from token.
     */
    user: true,
  });

export const CreateCredentialResponseSchema = PublicKeyCredentialDtoSchema;
