import { ApiKeySchema } from '@repo/api-key/validation';
import { DateSchemaCodec } from '@repo/validation';

export const ApiKeyDtoSchema = ApiKeySchema.extend({
  expiresAt: DateSchemaCodec.nullable(),
  revokedAt: DateSchemaCodec.nullable(),
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
