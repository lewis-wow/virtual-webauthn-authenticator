import { PublicKeyCredentialDescriptorSchema } from '../../models/credentials/PublicKeyCredentialDescriptorSchema';
import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const PublicKeyCredentialDescriptorDtoSchema =
  PublicKeyCredentialDescriptorSchema.extend({
    id: BytesSchemaCodec,
  });

export type PublicKeyCredentialDescriptorDto =
  typeof PublicKeyCredentialDescriptorDtoSchema;
