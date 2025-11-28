import z from 'zod';

import { AuditLogEntity } from '../../enums/AuditLogEntity';

export const AuditLogEntitySchema = z.enum(AuditLogEntity).meta({
  id: 'AuditLogEntity',
  examples: [AuditLogEntity.WEBAUTHN_CREDENTIAL],
});
