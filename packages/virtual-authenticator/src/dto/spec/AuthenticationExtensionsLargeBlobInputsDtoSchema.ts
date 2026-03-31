import { BytesSchemaCodec } from '@repo/core/validation';

import { AuthenticationExtensionsLargeBlobInputsSchema } from '../../validation/spec/AuthenticationExtensionsLargeBlobInputsSchema';

export const AuthenticationExtensionsLargeBlobInputsDtoSchema =
  AuthenticationExtensionsLargeBlobInputsSchema.extend({
    write: BytesSchemaCodec.optional(),
  });
