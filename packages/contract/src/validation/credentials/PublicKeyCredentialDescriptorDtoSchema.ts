import { PublicKeyCredentialDescriptorSchema } from '@repo/virtual-authenticator/validation';

import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const PublicKeyCredentialDescriptorDtoSchema =
  PublicKeyCredentialDescriptorSchema.extend({
    id: BytesSchemaCodec,
  });
