import { Injectable } from '@nestjs/common';
import { KeyClientService } from '../key_client/KeyClient.service.js';

@Injectable()
export class CredentialsService {
  constructor(private readonly keyClientService: KeyClientService) {}

  async create(opts: PublicKeyCredentialCreationOptions) {
    const { keyVaultKey, credentialId } =
      await this.keyClientService.createKey(opts);

    console.log('keyVaultKey', keyVaultKey);

    return {
      id: credentialId,
      rawId: Buffer.from(credentialId),
      response: {},
      type: 'public-key',
    };
  }

  async get() {}
}
