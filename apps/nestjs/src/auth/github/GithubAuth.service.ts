import { Injectable, UseFilters } from '@nestjs/common';
import { PrismaService } from '@/services/Prisma.service';
import { UsersService } from '@/users/Users.service';
import { PrismaClientExceptionFilter } from '../../lib/filters/PrismaClientException.filter';
import { User } from '@repo/prisma';
import { Profile as GithubProfile } from 'passport-github2';
import { Pick } from '@/lib/decorators/pick.decorator';
import { USER_PUBLIC_FIELDS } from '@/lib/fields/USER_PUBLIC_FIELDS';

@Injectable()
export class GithhubAuthService {
  private static readonly GITHUB_PROVIDER_NAME = 'github';

  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @UseFilters(PrismaClientExceptionFilter)
  @Pick(USER_PUBLIC_FIELDS)
  async validateGithubUser(
    profile: Pick<GithubProfile, 'id' | 'displayName' | 'emails'>,
  ): Promise<User> {
    const account = await this.prismaService.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: GithhubAuthService.GITHUB_PROVIDER_NAME,
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
        provider: GithhubAuthService.GITHUB_PROVIDER_NAME,
        providerAccountId: profile.id,
      },
    });

    return user;
  }
}
