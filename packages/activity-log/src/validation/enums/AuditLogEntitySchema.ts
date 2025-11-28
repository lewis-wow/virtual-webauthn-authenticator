import { Schema } from 'effect';

import { AuditLogEntity } from '../../enums/LogEntity';

export const AuditLogEntitySchema = Schema.Enums(AuditLogEntity).annotations({
  identifier: 'AuditLogEntity',
  examples: [AuditLogEntity.WEBAUTHN_CREDENTIAL],
});
