import { WebAuthnCredentialKeyMetaType } from '@repo/enums';
import z from 'zod';

import {
  WebAuthnCredentialBaseSchema,
  WebAuthnCredentialBaseSchemaCodec,
} from './WebAuthnCredentialBaseSchema';
import {
  WebAuthnCredentialKeyVaultKeyMetaSchema,
  WebAuthnCredentialKeyVaultKeyMetaSchemaCodec,
} from './WebAuthnCredentialKeyVaultKeyMetaSchema';

export const WebAuthnCredentialKeyVaultSchema =
  WebAuthnCredentialBaseSchema.extend({
    webAuthnCredentialKeyMetaType: z.literal(
      WebAuthnCredentialKeyMetaType.KEY_VAULT,
    ),
    webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMetaSchema,
  });

export const WebAuthnCredentialKeyVaultSchemaCodec =
  WebAuthnCredentialBaseSchemaCodec.extend({
    webAuthnCredentialKeyMetaType: z.literal(
      WebAuthnCredentialKeyMetaType.KEY_VAULT,
    ),
    webAuthnCredentialKeyVaultKeyMeta:
      WebAuthnCredentialKeyVaultKeyMetaSchemaCodec,
  });

export type WebAuthnCredentialKeyVault = z.infer<
  typeof WebAuthnCredentialKeyVaultSchema
>;
