import type { WebAuthnCredentialKeyMetaType } from '../enums/WebAuthnCredentialKeyMetaType';
import type { WebAuthnCredentialKeyVaultKeyMeta } from '../validation/WebAuthnCredentialKeyVaultKeyMetaSchema';

export type WebAuthnCredentialMeta = {
  webAuthnCredentialKeyMetaType: typeof WebAuthnCredentialKeyMetaType.KEY_VAULT;
  webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMeta;
};
