import { Provider } from '@nestjs/common';
import { AuditLog } from '@repo/audit-log';

import { PrismaService } from './Prisma.service';

export const AuditLogProvider: Provider = {
  provide: AuditLog,
  useFactory: (prisma: PrismaService) => {
    const auditLog = new AuditLog({
      prisma,
    });

    return auditLog;
  },
  inject: [PrismaService],
};
