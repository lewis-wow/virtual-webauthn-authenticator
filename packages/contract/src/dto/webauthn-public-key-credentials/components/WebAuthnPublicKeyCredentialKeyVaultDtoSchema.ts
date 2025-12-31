import { WebAuthnPublicKeyCredentialKeyVaultSchema } from '@repo/virtual-authenticator/zod-validation';

import { WebAuthnPublicKeyCredentialBaseDtoSchema } from './WebAuthnPublicKeyCredentialBaseDtoSchema';
import { WebAuthnPublicKeyCredentialKeyVaultKeyMetaDtoSchema } from './WebAuthnPublicKeyCredentialKeyVaultKeyMetaDtoSchema';

export const WebAuthnPublicKeyCredentialKeyVaultDtoSchema =
  WebAuthnPublicKeyCredentialKeyVaultSchema.extend(
    WebAuthnPublicKeyCredentialBaseDtoSchema.shape,
  ).extend({
    webAuthnPublicKeyCredentialKeyVaultKeyMeta:
      WebAuthnPublicKeyCredentialKeyVaultKeyMetaDtoSchema,
  });
