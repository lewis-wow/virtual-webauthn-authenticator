import type { ValueOfEnum } from '@repo/types';

/**
 * Defines the storage mechanism type for WebAuthn credential private keys.
 * This is an internal classification used by the virtual authenticator.
 */
export const WebAuthnPublicKeyCredentialKeyMetaType = {
  /**
   * Indicates the credential's private key is stored in a key vault (e.g., Azure Key Vault).
   * The key vault provides hardware-backed security and centralized key management.
   */
  KEY_VAULT: 'KEY_VAULT',
} as const;

export type WebAuthnPublicKeyCredentialKeyMetaType = ValueOfEnum<
  typeof WebAuthnPublicKeyCredentialKeyMetaType
>;
