import {
  KeyClient,
  KeyClientOptions,
  JsonWebKey,
  KeyVaultKey,
} from '@azure/keyvault-keys';
import { TokenCredential } from '@azure/identity';

export type KeyVaultServiceOptions = {
  azureKeyVaultHost: string;
  credential: TokenCredential;
  options?: KeyClientOptions;
};

export class KeyVaultService {
  private readonly client: KeyClient;

  constructor(opts: KeyVaultServiceOptions) {
    this.client = new KeyClient(
      opts.azureKeyVaultHost,
      opts.credential,
      opts.options,
    );
  }

  public async getJsonWebKey(keyName: string): Promise<JsonWebKey> {
    const key = await this.client.getKey(keyName);

    if (!key.key) {
      throw new Error();
    }

    return key.key;
  }

  public async createKey(keyName: string): Promise<KeyVaultKey> {
    const key = await this.client.createEcKey(keyName, {
      curve: 'P-256',
    });

    return key;
  }
}
