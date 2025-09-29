import { Body, Controller, Post } from '@nestjs/common';
import { CredentialsService } from '../services/Credentials.service.js';
import { PublicKeyCredentialCreationOptionsDto } from '../dto/PublicKeyCredentialCreationOptions.dto.js';
import { ApiBody } from '@nestjs/swagger';

@Controller()
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

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
