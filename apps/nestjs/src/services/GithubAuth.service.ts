import { Injectable, UseFilters } from '@nestjs/common';
import { PrismaService } from './Prisma.service';
import { UsersService } from './Users.service';
import { PrismaClientExceptionFilter } from '../filters/PrismaClientException.filter';
import { User } from '@repo/prisma';
import { Profile as GithubProfile } from 'passport-github2';

@Injectable()
export class GithhubAuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @UseFilters(PrismaClientExceptionFilter)
  async validateGithubUser(
    profile: Pick<GithubProfile, 'id' | 'displayName' | 'emails'>,
  ): Promise<User> {
    const account = await this.prismaService.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'github',
          providerAccountId: profile.id,
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
      email: profile.emails?.[0]?.value!,
      name: profile.displayName,
      image: null,
    });

    await this.prismaService.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: 'github',
        providerAccountId: profile.id,
      },
    });

    return user;
  }
}
