import { Body, Controller, Post } from '@nestjs/common';
import { CredentialsService } from './Credentials.service.js';
import { PublicKeyCredentialCreationOptionsDto } from '@/lib/dto/PublicKeyCredentialCreationOptions.dto.js';
import { ApiBody } from '@nestjs/swagger';
import { PrismaService } from '../services/Prisma.service.js';

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
