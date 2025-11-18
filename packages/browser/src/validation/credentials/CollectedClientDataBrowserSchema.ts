import { BytesBufferSourceSchemaCodec } from '../../../../validation/src/browser/BytesBufferSourceSchemaCodec';
import { CollectedClientDataSchema } from '../../models/credentials/CollectedClientDataSchema';

export const CollectedClientDataBrowserSchema =
  CollectedClientDataSchema.extend({
    challenge: BytesBufferSourceSchemaCodec,
  });
