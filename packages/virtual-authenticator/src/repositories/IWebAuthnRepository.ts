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
  existsByRpIdAndCredentialIds(opts: {
    rpId: string;
    credentialIds: string[];
  }): Promise<boolean>;

  createKeyVaultWebAuthnCredential(
    data: CreateKeyVaultDataArgs,
  ): Promise<WebAuthnCredentialWithMeta>;

  findFirstAndIncrementCounterAtomicallyOrThrow(opts: {
    rpId: string;
    userId: string;
    apiKeyId: string | null | undefined;
    allowCredentialIds?: string[];
  }): Promise<WebAuthnCredentialWithMeta>;
}
