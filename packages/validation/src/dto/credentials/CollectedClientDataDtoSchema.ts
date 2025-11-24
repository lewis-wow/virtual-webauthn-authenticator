import { CollectedClientDataSchema } from '../../models/credentials/CollectedClientDataSchema';
import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const CollectedClientDataDtoSchema = CollectedClientDataSchema.extend({
  challenge: BytesSchemaCodec,
});
