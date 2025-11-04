import type { TokenCredential } from '@azure/identity';
import {
  CryptographyClient,
  type CryptographyClientOptions,
  type KeyVaultKey,
} from '@azure/keyvault-keys';

export type CryptographyClientFactoryOptions = {
  azureCredential: TokenCredential;
  cryptographyClientOptions?: CryptographyClientOptions;
};

export class CryptographyClientFactory {
  private readonly azureCredential: TokenCredential;
  private readonly cryptographyClientOptions:
    | CryptographyClientOptions
    | undefined;

  constructor(opts: CryptographyClientFactoryOptions) {
    this.azureCredential = opts.azureCredential;
    this.cryptographyClientOptions = opts.cryptographyClientOptions;
  }

  createCryptographyClient(opts: {
    keyVaultKey: KeyVaultKey | string;
  }): CryptographyClient {
    const { keyVaultKey } = opts;

    return new CryptographyClient(
      keyVaultKey,
      this.azureCredential,
      this.cryptographyClientOptions,
    );
  }
}
