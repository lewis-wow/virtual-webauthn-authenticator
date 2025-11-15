import { DateSchemaCodec } from '../../codecs/DateSchemaCodec';
import { ApiKeySchema } from '../../models/auth/ApiKeySchema';

export const ApiKeyDtoSchema = ApiKeySchema.extend({
  expiresAt: DateSchemaCodec.optional().nullable(),
  revokedAt: DateSchemaCodec.optional().nullable(),

  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
