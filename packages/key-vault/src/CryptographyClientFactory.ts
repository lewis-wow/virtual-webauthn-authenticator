import type { TokenCredential } from '@azure/identity';
import { CryptographyClient, type KeyVaultKey } from '@azure/keyvault-keys';

export type CryptographyClientFactoryOptions = {
  azureCredential: TokenCredential;
};

export class CryptographyClientFactory {
  private readonly azureCredential: TokenCredential;

  constructor(opts: CryptographyClientFactoryOptions) {
    this.azureCredential = opts.azureCredential;
  }

  createCryptographyClient(
    keyVaultKey: KeyVaultKey | string,
  ): CryptographyClient {
    return new CryptographyClient(keyVaultKey, this.azureCredential);
  }
}
