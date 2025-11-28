import { PublicKeyCredentialDescriptorSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesSchemaCodec } from '../../dto/codecs/BytesSchemaCodec';

export const PublicKeyCredentialDescriptorDtoSchema =
  PublicKeyCredentialDescriptorSchema.extend({
    id: BytesSchemaCodec,
  });
