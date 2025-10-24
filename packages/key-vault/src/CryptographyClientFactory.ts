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

  createCryptographyClient(opts: {
    keyVaultKey: KeyVaultKey | string;
  }): CryptographyClient {
    const { keyVaultKey } = opts;

    return new CryptographyClient(keyVaultKey, this.azureCredential);
  }
}
