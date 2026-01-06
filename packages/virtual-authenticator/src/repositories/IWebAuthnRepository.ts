import type { WebAuthnPublicKeyCredentialWithMeta } from '../types/WebAuthnPublicKeyCredentialWithMeta';
import type { PublicKeyCredentialCandidate } from '../validation/PublicKeyCredentialCandidateSchema';

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

  findAllCredentialCandidatesByRpIdAndUserWithAllowCredentialDescriptorList(opts: {
    rpId: string;
    userId: string;
    apiKeyId: string | null;
    allowCredentialDescriptorList: string[] | undefined;
  }): Promise<PublicKeyCredentialCandidate[]>;

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
