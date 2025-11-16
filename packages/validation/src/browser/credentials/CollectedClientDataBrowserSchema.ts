import { CollectedClientDataSchema } from '../../models/credentials/CollectedClientDataSchema';
import { BytesBufferSourceSchemaCodec } from '../BytesBufferSourceSchemaCodec';

export const CollectedClientDataBrowserSchema = CollectedClientDataSchema.extend({
  challenge: BytesBufferSourceSchemaCodec,
});
