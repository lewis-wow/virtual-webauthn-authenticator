import { PublicKeyCredentialUserEntitySchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesSchemaCodec } from '../codecs/BytesSchemaCodec';

export const PublicKeyCredentialUserEntityDtoSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesSchemaCodec,
  });
