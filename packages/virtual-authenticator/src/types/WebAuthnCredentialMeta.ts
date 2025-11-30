import type { WebAuthnCredentialKeyMetaType } from '../enums/WebAuthnCredentialKeyMetaType';
import type { WebAuthnCredentialKeyVaultKeyMeta } from '../zod-validation/WebAuthnCredentialKeyVaultKeyMetaSchema';

export type WebAuthnCredentialMeta = {
  webAuthnCredentialKeyMetaType: typeof WebAuthnCredentialKeyMetaType.KEY_VAULT;
  webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMeta;
};
