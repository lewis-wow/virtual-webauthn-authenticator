import { Module } from '@nestjs/common';
import { PrismaService } from '../services/Prisma.service';
import { KeyClientProvider } from './KeyClient.provider';
import { KeyClientService } from './KeyClient.service';

@Module({
  providers: [PrismaService, KeyClientProvider],
  exports: [KeyClientService],
})
export class KeyClientModule {}
