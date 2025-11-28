import { PublicKeyCredentialDescriptorSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesSchemaCodec } from '../../codecs/BytesSchemaCodec';

export const PublicKeyCredentialDescriptorDtoSchema =
  PublicKeyCredentialDescriptorSchema.extend({
    id: BytesSchemaCodec,
  });
