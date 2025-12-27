import type { WebAuthnPublicKeyCredentialKeyMetaType } from '../enums/WebAuthnPublicKeyCredentialKeyMetaType';
import type { WebAuthnCredentialKeyVaultKeyMeta } from '../zod-validation/WebAuthnCredentialKeyVaultKeyMetaSchema';

export type WebAuthnCredentialMeta = {
  webAuthnPublicKeyCredentialKeyMetaType: typeof WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT;
  webAuthnPublicKeyCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMeta;
};
