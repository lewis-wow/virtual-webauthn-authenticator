import { Injectable } from '@nestjs/common';
import { CryptographyClient } from '@azure/keyvault-keys';
import { CoseAlgorithmIdentifier } from '@repo/enums';
import { CoseAlgorithmIdentifierMapper } from '@/lib/mappers/CoseAlgorithmIdentifierMapper.js';

@Injectable()
export class CryptographyClientService {
  constructor(private readonly cryptographyClient: CryptographyClient) {}

  async sign(opts: {
    algorithm: CoseAlgorithmIdentifier;
    data: Uint8Array;
  }): Promise<Uint8Array> {
    const { algorithm, data } = opts;

    const { result } = await this.cryptographyClient.signData(
      CoseAlgorithmIdentifierMapper.toKnownJsonWebKeySignatureAlgorithm(
        algorithm,
      ),
      data,
    );

    return result;
  }

  async verifySignature(opts: {
    algorithm: CoseAlgorithmIdentifier;
    signature: Uint8Array;
    data: Uint8Array;
  }): Promise<boolean> {
    const { algorithm, data, signature } = opts;

    const { result } = await this.cryptographyClient.verifyData(
      CoseAlgorithmIdentifierMapper.toKnownJsonWebKeySignatureAlgorithm(
        algorithm,
      ),
      data,
      signature,
    );

    return result;
  }
}
