import { WebAuthnCredentialKeyVaultSchema } from '@repo/virtual-authenticator/zod-validation';

import { WebAuthnCredentialBaseDtoSchema } from './WebAuthnCredentialBaseDtoSchema';
import { WebAuthnCredentialKeyVaultKeyMetaDtoSchema } from './WebAuthnCredentialKeyVaultKeyMetaDtoSchema';

export const WebAuthnCredentialKeyVaultDtoSchema =
  WebAuthnCredentialBaseDtoSchema.extend(
    WebAuthnCredentialKeyVaultSchema.shape,
  ).extend({
    webAuthnCredentialKeyVaultKeyMeta:
      WebAuthnCredentialKeyVaultKeyMetaDtoSchema,
  });
