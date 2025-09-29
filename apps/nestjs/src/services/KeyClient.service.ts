import { Injectable } from '@nestjs/common';
import { KeyClient, KeyVaultKey } from '@azure/keyvault-keys';
import { COSEAlgorithmIdentifier } from '../enums/COSEAlgorithmIdentifier.js';
import { COSEAlgorithmIdentifierMapper } from '../mappers/COSEAlgorithmIdentifierMapper.js';

@Injectable()
export class KeyClientService {
  constructor(private readonly keyClient: KeyClient) {}

  async createKey(opts: {
    keyName: string;
    algorithm: COSEAlgorithmIdentifier;
  }): Promise<KeyVaultKey> {
    const { keyName, algorithm } = opts;

    const result = await this.keyClient.createKey(
      keyName,
      COSEAlgorithmIdentifierMapper.toKnownJsonWebKeyType(algorithm),
      {
        curve:
          COSEAlgorithmIdentifierMapper.toKnownJsonWebKeyCurveName(algorithm),
      },
    );

    return result;
  }
}
