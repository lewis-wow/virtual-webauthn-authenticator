import { Injectable, UseFilters } from '@nestjs/common';
import { PrismaService } from './Prisma.service';
import { UsersService } from './Users.service';
import { PrismaClientExceptionFilter } from '../filters/PrismaClientException.filter';
import { User } from '@repo/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @UseFilters(PrismaClientExceptionFilter)
  async validateUser(profile: {
    githubId: string;
    name: string;
    email: string;
    image: string;
  }): Promise<User> {
    const account = await this.prismaService.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'github',
          providerAccountId: profile.githubId,
        },
      },
      include: {
        user: true,
      },
    });

    if (account) {
      return account.user;
    }

    const user = await this.usersService.create({
      email: profile.email,
      name: profile.name,
      image: profile.image,
    });

    await this.prismaService.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: 'github',
        providerAccountId: profile.githubId,
      },
    });

    return user;
  }
}
