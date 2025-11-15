import { CollectedClientDataSchema } from '../../models/credentials/CollectedClientDataSchema';
import { BytesDtoSchema } from '../common/BytesDtoSchema';

export const CollectedClientDataDtoSchema = CollectedClientDataSchema.extend({
  challenge: BytesDtoSchema,
});
