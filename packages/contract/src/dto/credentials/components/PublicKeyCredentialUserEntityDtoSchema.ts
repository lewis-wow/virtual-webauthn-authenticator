import { PublicKeyCredentialUserEntitySchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesSchemaCodec } from '../../dto/codecs/BytesSchemaCodec';

export const PublicKeyCredentialUserEntityDtoSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesSchemaCodec,
  });
