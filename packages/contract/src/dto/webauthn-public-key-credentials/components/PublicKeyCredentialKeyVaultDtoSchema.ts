import { WebAuthnPublicKeyCredentialKeyVaultSchema } from '@repo/virtual-authenticator/validation';

import { PublicKeyCredentialBaseDtoSchema } from './PublicKeyCredentialBaseDtoSchema';
import { PublicKeyCredentialKeyVaultKeyMetaDtoSchema } from './PublicKeyCredentialKeyVaultKeyMetaDtoSchema';

export const PublicKeyCredentialKeyVaultDtoSchema =
  WebAuthnPublicKeyCredentialKeyVaultSchema.extend(
    PublicKeyCredentialBaseDtoSchema.shape,
  ).extend({
    webAuthnPublicKeyCredentialKeyVaultKeyMeta:
      PublicKeyCredentialKeyVaultKeyMetaDtoSchema,
  });
