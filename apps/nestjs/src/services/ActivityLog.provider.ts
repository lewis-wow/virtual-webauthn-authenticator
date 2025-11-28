import { Provider } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';

import { PrismaService } from './Prisma.service';

export const ActivityLogProvider: Provider = {
  provide: ActivityLog,
  useFactory: (prisma: PrismaService) => {
    const activityLog = new ActivityLog({
      prisma,
    });

    return activityLog;
  },
  inject: [PrismaService],
};
