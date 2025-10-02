import { Module } from '@nestjs/common';
import { UsersService } from '../services/Users.service';
import { UsersController } from '../controllers/Users.controller';
import { PrismaService } from '../services/Prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
