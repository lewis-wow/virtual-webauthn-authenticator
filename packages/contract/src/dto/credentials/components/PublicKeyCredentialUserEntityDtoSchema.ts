import { PublicKeyCredentialUserEntitySchema } from '@repo/virtual-authenticator/validation';

import { BytesSchemaCodec } from '../../codecs/BytesSchemaCodec';

export const PublicKeyCredentialUserEntityDtoSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesSchemaCodec,
  });
