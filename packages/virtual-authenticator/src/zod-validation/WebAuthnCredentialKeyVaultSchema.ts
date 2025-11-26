import z from 'zod';

import { WebAuthnCredentialKeyMetaType } from '../enums/WebAuthnCredentialKeyMetaType';
import { WebAuthnCredentialBaseSchema } from './WebAuthnCredentialBaseSchema';
import { WebAuthnCredentialKeyVaultKeyMetaSchema } from './WebAuthnCredentialKeyVaultKeyMetaSchema';

export const WebAuthnCredentialKeyVaultSchema =
  WebAuthnCredentialBaseSchema.extend({
    webAuthnCredentialKeyMetaType: z.literal(
      WebAuthnCredentialKeyMetaType.KEY_VAULT,
    ),
    webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMetaSchema,
  });

export type WebAuthnCredentialKeyVault = z.infer<
  typeof WebAuthnCredentialKeyVaultSchema
>;
