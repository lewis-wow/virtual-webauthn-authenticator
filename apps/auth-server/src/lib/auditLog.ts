import { AuditLog } from '@repo/audit-log';

import { prisma } from './prisma';

export const auditLog = new AuditLog({
  prisma,
});
