import { BytesSchemaCodec } from '@repo/validation';

import { PublicKeyCredentialUserEntitySchema } from '../../validation/spec/PublicKeyCredentialUserEntitySchema';

export const PublicKeyCredentialUserEntityDtoSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesSchemaCodec,
  });
