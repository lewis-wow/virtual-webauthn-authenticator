import { Provider } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';
import EventEmitter from 'node:events';

import { PrismaService } from './Prisma.service';

export const ActivityLogProvider: Provider = {
  provide: ActivityLog,
  useFactory: (prisma: PrismaService) => {
    const eventEmitter = new EventEmitter();

    const activityLog = new ActivityLog({
      prisma,
      eventEmitter,
    });

    return activityLog;
  },
  inject: [PrismaService],
};
