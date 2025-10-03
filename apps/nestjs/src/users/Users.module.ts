import { Module } from '@nestjs/common';
import { UsersService } from './Users.service';
import { UsersController } from './Users.controller';
import { PrismaService } from '../services/Prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
