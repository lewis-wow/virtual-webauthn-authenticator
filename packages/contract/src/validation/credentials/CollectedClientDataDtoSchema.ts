import { CollectedClientDataSchema } from '@repo/virtual-authenticator/validation';

import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const CollectedClientDataDtoSchema = CollectedClientDataSchema.extend({
  challenge: BytesSchemaCodec,
});
