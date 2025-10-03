import { Module } from '@nestjs/common';
import { PrismaService } from '../services/Prisma.service';
import { CredentialsController } from './Credentials.controller';
import { CredentialsService } from './Credentials.service';

@Module({
  controllers: [CredentialsController],
  providers: [PrismaService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
