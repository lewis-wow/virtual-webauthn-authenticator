import { Provider } from '@nestjs/common';
import { EventLog } from '@repo/event-log';

import { PrismaService } from './Prisma.service';

export const EventLogProvider: Provider = {
  provide: EventLog,
  useFactory: (prisma: PrismaService) => {
    const eventLog = new EventLog({
      prisma,
    });

    return eventLog;
  },
  inject: [PrismaService],
};
