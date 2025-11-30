import { ApiKeySchema } from '@repo/auth/zod-validation';

import { DateSchemaCodec } from '../../codecs/DateSchemaCodec';

export const ApiKeyDtoSchema = ApiKeySchema.extend({
  expiresAt: DateSchemaCodec.nullable(),
  revokedAt: DateSchemaCodec.nullable(),
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
