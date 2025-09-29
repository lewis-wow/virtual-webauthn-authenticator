import { Injectable } from '@nestjs/common';
import { PublicKeyCredentialCreationOptionsDto } from '../dto/PublicKeyCredentialCreationOptions.dto.js';
import { KeyClientService } from './KeyClient.service.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CredentialsService {
  constructor(private readonly keyClientService: KeyClientService) {}

  async create(opts: PublicKeyCredentialCreationOptionsDto) {
    const selectedAlgorithm = opts.pubKeyCredParams[0]!.alg;

    const serviceIdentifier = Buffer.from(opts.rp.id!).toString('base64url');
    const userIdentifier = Buffer.from(opts.user.id).toString('base64url');
    const credentialID = randomUUID();

    const keyName = `${serviceIdentifier}-${userIdentifier}-${credentialID}`;

    const key = await this.keyClientService.createKey({
      keyName,
      algorithm: selectedAlgorithm,
    });

    console.log('key', key);

    return {
      id: credentialID,
      rawId: Buffer.from(credentialID),
      response: {},
      type: 'public-key',
    };
  }

  async get() {}
}
