import { BytesSchemaCodec } from '@repo/core/validation';

import { CollectedClientDataSchema } from '../../validation/spec/CollectedClientDataSchema';

export const CollectedClientDataDtoSchema = CollectedClientDataSchema.extend({
  challenge: BytesSchemaCodec,
});
