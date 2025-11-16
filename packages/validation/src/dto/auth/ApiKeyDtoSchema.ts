import { ApiKeySchema } from '../../models/auth/ApiKeySchema';
import { DateSchemaCodec } from '../common/DateSchemaCodec';

export const ApiKeyDtoSchema = ApiKeySchema.extend({
  expiresAt: DateSchemaCodec.optional().nullable(),
  revokedAt: DateSchemaCodec.optional().nullable(),

  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
