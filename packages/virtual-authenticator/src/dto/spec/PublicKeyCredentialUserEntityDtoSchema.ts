import { BytesSchemaCodec } from '@repo/core/zod-validation';

import { PublicKeyCredentialUserEntitySchema } from '../../validation/spec/PublicKeyCredentialUserEntitySchema';

export const PublicKeyCredentialUserEntityDtoSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesSchemaCodec,
  });
