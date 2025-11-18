import { PublicKeyCredentialUserEntitySchema } from '@repo/virtual-authenticator/validation';

import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const PublicKeyCredentialUserEntityDtoSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesSchemaCodec,
  });
