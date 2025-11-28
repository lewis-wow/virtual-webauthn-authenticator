import { ActivityLog } from '@repo/activity-log';

import { prisma } from './prisma';

export const activityLog = new ActivityLog({
  prisma,
});
