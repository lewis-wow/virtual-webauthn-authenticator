import { ChainedTokenCredential, GetTokenOptions } from '@azure/identity';
import { KeyClient, KeyClientOptions } from '@azure/keyvault-keys';

class NoopCredential extends ChainedTokenCredential {
  async getToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _scopes: string | string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: GetTokenOptions,
  ): Promise<{
    expiresOnTimestamp: number;
    token: string;
  }> {
    return Promise.resolve({
      expiresOnTimestamp: new Date().getTime() + 30000,
      token: 'noop',
    });
  }
}

const credential = new NoopCredential();
const url = 'https://localhost:3443';
const options: KeyClientOptions = {
  serviceVersion: '7.4',
  // DEV ONLY
  disableChallengeResourceVerification: true,
};

const client = new KeyClient(url, credential, options);
const keyVaultKey = await client.createRsaKey('rsa-key', {
  keySize: 2048,
  keyOps: ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
});

console.log('keyVaultKey', keyVaultKey);
