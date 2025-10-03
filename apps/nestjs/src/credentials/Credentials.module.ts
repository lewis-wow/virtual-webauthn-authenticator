import { Module } from '@nestjs/common';
import { PrismaService } from '../services/Prisma.service';
import { CredentialsController } from './Credentials.controller';
import { CredentialsService } from './Credentials.service';
import { KeyClientModule } from '../key_client/KeyClient.module';

@Module({
  imports: [KeyClientModule],
  controllers: [CredentialsController],
  providers: [PrismaService, CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
