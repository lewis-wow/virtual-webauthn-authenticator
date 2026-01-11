import { BytesSchemaCodec } from '@repo/core/zod-validation';
import { PublicKeyCredentialDescriptorSchema } from '@repo/virtual-authenticator/validation';

export const PublicKeyCredentialDescriptorDtoSchema =
  PublicKeyCredentialDescriptorSchema.extend({
    id: BytesSchemaCodec,
  });
