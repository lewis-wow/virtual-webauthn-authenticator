import type { WebAuthnCredentialWithMeta } from '../types/WebAuthnCredentialWithMeta';
import type { PublicKeyCredentialDescriptor } from '../zod-validation';
import type { WebAuthnCredential } from '../zod-validation/WebAuthnCredentialSchema';

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
  findAllByAllowCredentialDescriptorList(opts: {
    allowCredentialDescriptorList: Pick<PublicKeyCredentialDescriptor, 'id'>[];
  }): Promise<WebAuthnCredential[]>;

  findAllByRpIdAndUserId(opts: {
    userId: string;
    rpId: string;
    apiKeyId: string | null;
  }): Promise<WebAuthnCredential[]>;

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
    apiKeyId: string | null;
    allowCredentialDescriptorList: string[] | undefined;
  }): Promise<WebAuthnCredentialWithMeta>;
}
