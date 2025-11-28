import { AuditSchema } from '@repo/audit-log/zod-validation';

import { DateSchemaCodec } from '../../codecs/DateSchemaCodec';

export const AuditLogDtoSchema = AuditSchema.extend({
  createdAt: DateSchemaCodec,
  updatedAt: DateSchemaCodec,
});
