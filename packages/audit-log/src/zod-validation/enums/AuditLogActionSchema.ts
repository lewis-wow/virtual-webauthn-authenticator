import z from 'zod';

import { AuditLogAction } from '../../enums/AuditLogAction';

export const AuditLogActionSchema = z.enum(AuditLogAction).meta({
  id: 'AuditLogAction',
  examples: [AuditLogAction.CREATE],
});
