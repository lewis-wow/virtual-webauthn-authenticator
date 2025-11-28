import { CollectedClientDataSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesSchemaCodec } from '../../dto/codecs/BytesSchemaCodec';

export const CollectedClientDataDtoSchema = CollectedClientDataSchema.extend({
  challenge: BytesSchemaCodec,
});
