import type { PrismaClient } from '@repo/prisma';

import type { AzureKeyVault } from './AzureKeyVault';

export type KeyVaultOptions = {
  azureKeyVault: AzureKeyVault;
  prisma: PrismaClient;
};

export class KeyVault {
  private readonly prisma: PrismaClient;

  private _createKeyName() {
    await this.prisma.webAuthnCredential.findUnique({
      where: {
        ""
      }
    })
  }
}
