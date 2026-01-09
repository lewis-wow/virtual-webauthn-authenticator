import type { WebAuthnPublicKeyCredentialWithMeta } from '../types/WebAuthnPublicKeyCredentialWithMeta';
import type { ApplicablePublicKeyCredential } from '../validation/spec/ApplicablePublicKeyCredentialSchema';

export type CreateKeyVaultDataArgs = {
  id: string;
  name?: string;
  COSEPublicKey: Uint8Array;
  rpId: string;
  userId: string;
  apiKeyId: string | null;
  isClientSideDiscoverable: boolean;
} & {
  webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
    keyVaultKeyId: string | null;
    keyVaultKeyName: string;
    hsm: boolean;
  };
};

export interface IWebAuthnRepository {
  createKeyVaultWebAuthnPublicKeyCredential(
    data: CreateKeyVaultDataArgs,
  ): Promise<WebAuthnPublicKeyCredentialWithMeta>;

  findAllByRpIdAndCredentialIds(opts: {
    rpId: string;
    credentialIds: string[];
  }): Promise<WebAuthnPublicKeyCredentialWithMeta[]>;

  findAllApplicableCredentialsByRpIdAndUserWithAllowCredentialDescriptorList(opts: {
    rpId: string;
    userId: string;
    apiKeyId: string | null;
    allowCredentialDescriptorList: string[] | undefined;
  }): Promise<ApplicablePublicKeyCredential[]>;

  incrementCounter(opts: {
    credentialId: string;
  }): Promise<WebAuthnPublicKeyCredentialWithMeta>;

  findFirstAndIncrementCounterAtomicallyOrThrow(opts: {
    rpId: string;
    userId: string;
    apiKeyId: string | null;
    allowCredentialDescriptorList: string[] | undefined;
  }): Promise<WebAuthnPublicKeyCredentialWithMeta>;
}
