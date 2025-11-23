import { Provider } from '@nestjs/common';
import { ProfileManager } from '@repo/auth';

import { PrismaService } from './Prisma.service';

export const ProfileManagerProvider: Provider = {
  provide: ProfileManager,
  useFactory: (prisma: PrismaService) => {
    const profileManager = new ProfileManager({
      prisma,
    });

    return profileManager;
  },
  inject: [PrismaService],
};
