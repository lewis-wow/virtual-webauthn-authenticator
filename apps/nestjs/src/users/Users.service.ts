import { Injectable, UseFilters } from '@nestjs/common';
import { User } from '@repo/prisma';
import { PrismaService } from '@/services/Prisma.service';
import { PrismaClientExceptionFilter } from '../lib/filters/PrismaClientException.filter';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  @UseFilters(PrismaClientExceptionFilter)
  async findById(id: string): Promise<User> {
    return await this.prismaService.user.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  @UseFilters(PrismaClientExceptionFilter)
  async create(data: Pick<User, 'email' | 'name' | 'image'>): Promise<User> {
    return await this.prismaService.user.create({
      data,
    });
  }
}
