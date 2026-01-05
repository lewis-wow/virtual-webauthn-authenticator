import { ApiKeySchema } from '@repo/auth/zod-validation';
import { DateSchemaCodec } from '@repo/core/zod-validation';

export const ApiKeyDtoSchema = ApiKeySchema.extend({
  expiresAt: DateSchemaCodec.nullable(),
  revokedAt: DateSchemaCodec.nullable(),
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
