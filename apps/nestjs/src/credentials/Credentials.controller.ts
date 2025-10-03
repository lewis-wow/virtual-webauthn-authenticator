import { Body, Controller, Post } from '@nestjs/common';
import { CredentialsService } from './Credentials.service';
import { PublicKeyCredentialCreationOptionsDto } from '@/credentials/dto/PublicKeyCredentialCreationOptions.dto';
import { ApiBody } from '@nestjs/swagger';
import { PrismaService } from '../services/Prisma.service';

@Controller()
export class CredentialsController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('/credentials')
  @ApiBody({ type: [PublicKeyCredentialCreationOptionsDto] })
  async createCredentials(
    @Body()
    publicKeyCredentialCreationOptionsDto: PublicKeyCredentialCreationOptionsDto,
  ) {
    const result = await this.credentialsService.create(
      publicKeyCredentialCreationOptionsDto,
    );

    return result;
  }
}
