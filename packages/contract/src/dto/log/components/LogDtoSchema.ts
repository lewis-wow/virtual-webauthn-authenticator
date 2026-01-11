import { LogSchema } from '@repo/activity-log/zod-validation';
import { DateSchemaCodec } from '@repo/core/zod-validation';

export const LogDtoSchema = LogSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
