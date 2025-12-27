import type { WebAuthnCredentialKeyMetaType } from '../enums/WebAuthnCredentialKeyMetaType';
import type { WebAuthnCredentialKeyVaultKeyMeta } from '../zod-validation/WebAuthnCredentialKeyVaultKeyMetaSchema';

export type WebAuthnCredentialMeta = {
  webAuthnPublicKeyCredentialKeyMetaType: typeof WebAuthnCredentialKeyMetaType.KEY_VAULT;
  webAuthnPublicKeyCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMeta;
};
