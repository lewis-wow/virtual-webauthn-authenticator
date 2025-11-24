import { Schema } from 'effect';

import { AuditLogActionSchema } from './enums/AuditLogActionSchema';
import { AuditLogEntitySchema } from './enums/AuditLogEntitySchema';

export const AuditSchema = Schema.Struct({
  action: AuditLogActionSchema,
  entity: AuditLogEntitySchema,
  entityId: Schema.NullOr(Schema.UUID),

  userId: Schema.UUID,
  apiKeyId: Schema.NullOr(Schema.UUID),

  metadata: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
});

export type Audit = Schema.Schema.Type<typeof AuditSchema>;
