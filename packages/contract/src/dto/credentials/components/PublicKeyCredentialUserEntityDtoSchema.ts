import { BytesSchemaCodec } from '@repo/core/zod-validation';
import { PublicKeyCredentialUserEntitySchema } from '@repo/virtual-authenticator/validation';

export const PublicKeyCredentialUserEntityDtoSchema =
  PublicKeyCredentialUserEntitySchema.extend({
    id: BytesSchemaCodec,
  });
