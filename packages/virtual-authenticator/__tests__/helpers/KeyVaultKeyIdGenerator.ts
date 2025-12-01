import { Buffer } from 'node:buffer';

export type KeyVaultData = {
  keyVaultKeyName: string;
  keyVaultKeyId: string;
};

export class KeyVaultKeyIdGenerator {
  private count: number = 0;

  private _getKeyVaultKeyId() {
    const nameBase = `KEY_VAULT_KEY_NAME_${this.count}`;
    const idBase = `KEY_VAULT_KEY_ID_${this.count}`;

    return {
      keyVaultKeyName: Buffer.from(nameBase).toString('hex'),
      keyVaultKeyId: Buffer.from(idBase).toString('hex'),
    };
  }

  public next(): KeyVaultData {
    this.count++;

    return this._getKeyVaultKeyId();
  }

  public getCurrent(): KeyVaultData {
    return this._getKeyVaultKeyId();
  }

  public reset(): void {
    this.count = 0;
  }

  public getCurrentIndex(): number {
    return this.count;
  }
}
