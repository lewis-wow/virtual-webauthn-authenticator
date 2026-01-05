import { BytesSchemaCodec } from '@repo/core/zod-validation';
import { CollectedClientDataSchema } from '@repo/virtual-authenticator/validation';

export const CollectedClientDataDtoSchema = CollectedClientDataSchema.extend({
  challenge: BytesSchemaCodec,
});
