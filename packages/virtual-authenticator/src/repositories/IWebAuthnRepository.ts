import type { WebAuthnCredentialWithMeta } from '../types/WebAuthnCredentialWithMeta';

export type CreateKeyVaultDataArgs = {
  id: string;
  COSEPublicKey: Uint8Array;
  rpId: string;
  userId: string;
  apiKeyId: string | null;
} & {
  webAuthnCredentialKeyVaultKeyMeta: {
    keyVaultKeyId: string | null;
    keyVaultKeyName: string;
    hsm: boolean;
  };
};

export interface IWebAuthnRepository {
  createKeyVaultWebAuthnCredential(
    data: CreateKeyVaultDataArgs,
  ): Promise<WebAuthnCredentialWithMeta>;

  findFirstAndIncrementCounterAtomically(opts: {
    rpId: string;
    userId: string;
    apiKeyId: string | null;
    allowCredentials?: string[];
  }): Promise<WebAuthnCredentialWithMeta | null>;
}
