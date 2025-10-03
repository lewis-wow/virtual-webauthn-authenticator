import { Module } from '@nestjs/common';
import { PrismaService } from '../services/Prisma.service';
import { CryptographyClientService } from './CryptographyClient.service';
import { CryptographyClientProvider } from './CryptographyClient.provider';

@Module({
  providers: [PrismaService, CryptographyClientProvider],
  exports: [CryptographyClientService],
})
export class CryptographyClientModule {}
