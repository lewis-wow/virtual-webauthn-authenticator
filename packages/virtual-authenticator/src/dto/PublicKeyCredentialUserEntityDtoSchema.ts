import { BytesSchemaCodec } from '@repo/core/zod-validation';

import { PublicKeyCredentialUserEntitySchema } from '../validation/PublicKeyCredentialUserEntitySchema';

export const PublicKeyCredentialUserEntityDtoSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesSchemaCodec,
  });
