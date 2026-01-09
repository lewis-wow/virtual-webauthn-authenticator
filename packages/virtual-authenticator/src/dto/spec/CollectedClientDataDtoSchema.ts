import { BytesSchemaCodec } from '@repo/core/zod-validation';

import { CollectedClientDataSchema } from '../../validation/spec/CollectedClientDataSchema';

export const CollectedClientDataDtoSchema = CollectedClientDataSchema.extend({
  challenge: BytesSchemaCodec,
});
