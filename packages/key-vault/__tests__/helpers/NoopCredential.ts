import { ChainedTokenCredential } from '@azure/identity';

export class NoopCredential extends ChainedTokenCredential {
  async getToken() {
    return Promise.resolve({
      expiresOnTimestamp: new Date().getTime() + 30000,
      token: 'noop',
    });
  }
}
