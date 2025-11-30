import { LogSchema } from '@repo/activity-log/zod-validation';

import { DateSchemaCodec } from '../../codecs/DateSchemaCodec';

export const LogDtoSchema = LogSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
