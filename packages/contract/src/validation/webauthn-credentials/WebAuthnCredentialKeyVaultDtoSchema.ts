import { WebAuthnCredentialKeyVaultSchema } from '@repo/virtual-authenticator/validation';

import { WebAuthnCredentialBaseDtoSchema } from './WebAuthnCredentialBaseDtoSchema';
import { WebAuthnCredentialKeyVaultKeyMetaDtoSchema } from './WebAuthnCredentialKeyVaultKeyMetaDtoSchema';

export const WebAuthnCredentialKeyVaultDtoSchema =
  WebAuthnCredentialKeyVaultSchema.extend({
    ...WebAuthnCredentialBaseDtoSchema.shape,
    webAuthnCredentialKeyVaultKeyMeta:
      WebAuthnCredentialKeyVaultKeyMetaDtoSchema,
  });
