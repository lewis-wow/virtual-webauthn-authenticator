import { AuthenticationExtensionsClientInputsSchema } from '../../validation/spec/AuthenticationExtensionsClientInputsSchema';
import { AuthenticationExtensionsLargeBlobInputsDtoSchema } from './AuthenticationExtensionsLargeBlobInputsDtoSchema';
import { AuthenticationExtensionsPRFInputsDtoSchema } from './AuthenticationExtensionsPRFInputsDtoSchema';

export const AuthenticationExtensionsClientInputsDtoSchema =
  AuthenticationExtensionsClientInputsSchema.extend({
    largeBlob: AuthenticationExtensionsLargeBlobInputsDtoSchema.optional(),
    prf: AuthenticationExtensionsPRFInputsDtoSchema.optional(),
  });
