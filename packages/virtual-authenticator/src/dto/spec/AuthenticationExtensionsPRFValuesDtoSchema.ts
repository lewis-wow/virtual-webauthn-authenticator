import { BytesSchemaCodec } from '@repo/core/validation';

import { AuthenticationExtensionsPRFValuesSchema } from '../../validation/spec/AuthenticationExtensionsPRFValuesSchema';

export const AuthenticationExtensionsPRFValuesDtoSchema =
  AuthenticationExtensionsPRFValuesSchema.extend({
    first: BytesSchemaCodec,
    second: BytesSchemaCodec.optional(),
  });
