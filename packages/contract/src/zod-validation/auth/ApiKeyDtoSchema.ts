import { ApiKeySchema } from '@repo/auth/zod-validation';

import { DateSchemaCodec } from '../codecs/DateSchemaCodec';

export const ApiKeyDtoSchema = ApiKeySchema.extend({
  expiresAt: DateSchemaCodec.optional().nullable(),
  revokedAt: DateSchemaCodec.optional().nullable(),

  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
