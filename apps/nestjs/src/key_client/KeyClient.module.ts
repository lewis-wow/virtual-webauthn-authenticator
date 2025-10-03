import { Module } from '@nestjs/common';
import { PrismaService } from '../services/Prisma.service';
import { KeyClientProvider } from './KeyClient.provider';
import { KeyClientService } from './KeyClient.service';
import { EnvModule } from '../env/Env.module';

@Module({
  imports: [EnvModule],
  providers: [PrismaService, KeyClientProvider, KeyClientService],
  exports: [KeyClientService],
})
export class KeyClientModule {}
