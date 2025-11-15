import { PublicKeyCredentialDescriptorSchema } from '../../models/credentials/PublicKeyCredentialDescriptorSchema';
import { BytesDtoSchema } from '../common/BytesDtoSchema';

export const PublicKeyCredentialDescriptorDtoSchema =
  PublicKeyCredentialDescriptorSchema.extend({
    id: BytesDtoSchema,
  });

export type PublicKeyCredentialDescriptorDto =
  typeof PublicKeyCredentialDescriptorDtoSchema;
