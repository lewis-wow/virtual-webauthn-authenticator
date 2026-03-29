import { LogSchema } from '@repo/activity-log/validation';
import { DateSchemaCodec } from '@repo/core/validation';

export const LogDtoSchema = LogSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
