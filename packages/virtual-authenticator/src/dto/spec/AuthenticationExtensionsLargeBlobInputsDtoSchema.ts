import { BytesSchemaCodec } from '@repo/validation';

import { AuthenticationExtensionsLargeBlobInputsSchema } from '../../validation/spec/AuthenticationExtensionsLargeBlobInputsSchema';

export const AuthenticationExtensionsLargeBlobInputsDtoSchema =
  AuthenticationExtensionsLargeBlobInputsSchema.extend({
    write: BytesSchemaCodec.optional(),
  });
