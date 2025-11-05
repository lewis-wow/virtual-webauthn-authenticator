import { WebAuthnCredentialKeyMetaType } from '@repo/enums';
import z from 'zod';

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
