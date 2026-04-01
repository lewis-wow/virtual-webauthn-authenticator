import { LogSchema } from '@repo/activity-log/validation';
import { DateSchemaCodec } from '@repo/validation';

export const LogDtoSchema = LogSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
