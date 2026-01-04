import { CollectedClientDataSchema } from '@repo/virtual-authenticator/validation';

import { BytesSchemaCodec } from '../../codecs/BytesSchemaCodec';

export const CollectedClientDataDtoSchema = CollectedClientDataSchema.extend({
  challenge: BytesSchemaCodec,
});
