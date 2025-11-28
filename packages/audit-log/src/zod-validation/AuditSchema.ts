import z from 'zod';

import { AuditLogActionSchema } from './enums/AuditLogActionSchema';
import { AuditLogEntitySchema } from './enums/AuditLogEntitySchema';

export const AuditSchema = z.object({
  id: z.uuid(),

  action: AuditLogActionSchema,
  entity: AuditLogEntitySchema,
  entityId: z.uuid().nullable(),

  userId: z.uuid(),
  apiKeyId: z.uuid().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),

  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type Audit = z.infer<typeof AuditSchema>;
