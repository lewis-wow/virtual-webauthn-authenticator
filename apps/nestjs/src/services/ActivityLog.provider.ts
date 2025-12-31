import { Provider } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';
import { Logger } from '@repo/logger';

import { PrismaService } from './Prisma.service';

export const ActivityLogProvider: Provider = {
  provide: ActivityLog,
  useFactory: (prisma: PrismaService, logger: Logger) => {
    const activityLog = new ActivityLog({
      prisma,
      logger,
    });

    return activityLog;
  },
  inject: [PrismaService, Logger],
};
