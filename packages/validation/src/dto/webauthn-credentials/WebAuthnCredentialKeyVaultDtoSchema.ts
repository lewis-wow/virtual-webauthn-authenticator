import { WebAuthnCredentialKeyVaultSchema } from '../../models/webauthn-credential/WebAuthnCredentialKeyVaultSchema';
import { WebAuthnCredentialBaseDtoSchema } from './WebAuthnCredentialBaseDtoSchema';
import { WebAuthnCredentialKeyVaultKeyMetaDtoSchema } from './WebAuthnCredentialKeyVaultKeyMetaDtoSchema';

export const WebAuthnCredentialKeyVaultDtoSchema =
  WebAuthnCredentialKeyVaultSchema.extend({
    ...WebAuthnCredentialBaseDtoSchema.shape,
    webAuthnCredentialKeyVaultKeyMeta:
      WebAuthnCredentialKeyVaultKeyMetaDtoSchema,
  });

export type WebAuthnCredentialKeyVaultDto =
  typeof WebAuthnCredentialKeyVaultDtoSchema;
