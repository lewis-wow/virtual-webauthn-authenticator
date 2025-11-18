import type { KeyVaultKey } from '@azure/keyvault-keys';
import type { KeyAlgorithm } from '@repo/keys/enums';

import type { KeyVault } from './KeyVault';

export type CredentialSignerFactoryOptions = {
  keyVault: KeyVault;
};

export class CredentialSignerFactory {
  private readonly keyVault: KeyVault;

  constructor(opts: CredentialSignerFactoryOptions) {
    this.keyVault = opts.keyVault;
  }

  createCredentialSigner(opts: {
    algorithm: KeyAlgorithm;
    keyVaultKey: KeyVaultKey;
  }) {
    const { algorithm, keyVaultKey } = opts;

    return {
      sign: async (data: Uint8Array) => {
        const { signature } = await this.keyVault.sign({
          keyVaultKey,
          algorithm,
          data,
        });

        return signature;
      },
    };
  }
}
