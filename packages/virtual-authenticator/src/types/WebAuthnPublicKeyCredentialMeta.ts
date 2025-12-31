import type { WebAuthnPublicKeyCredentialKeyMetaType } from '../enums/WebAuthnPublicKeyCredentialKeyMetaType';
import type { WebAuthnPublicKeyCredentialKeyVaultKeyMeta } from '../zod-validation/WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema';

export type WebAuthnPublicKeyCredentialMeta = {
  webAuthnPublicKeyCredentialKeyMetaType: typeof WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT;
  webAuthnPublicKeyCredentialKeyVaultKeyMeta: WebAuthnPublicKeyCredentialKeyVaultKeyMeta;
};
