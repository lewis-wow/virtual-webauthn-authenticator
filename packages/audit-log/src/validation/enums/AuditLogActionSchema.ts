import { Schema } from 'effect';

import { AuditLogAction } from '../../enums/AuditLogAction';

export const AuditLogActionSchema = Schema.Enums(AuditLogAction).annotations({
  identifier: 'AuditLogAction',
  examples: [AuditLogAction.CREATE],
});
