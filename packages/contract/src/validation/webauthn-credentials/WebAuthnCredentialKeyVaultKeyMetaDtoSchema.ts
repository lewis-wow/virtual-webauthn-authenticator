import { WebAuthnCredentialKeyVaultKeyMetaSchema } from '@repo/virtual-authenticator/validation';

import { DateSchemaCodec } from '../common/DateSchemaCodec';

export const WebAuthnCredentialKeyVaultKeyMetaDtoSchema =
  WebAuthnCredentialKeyVaultKeyMetaSchema.extend({
    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  });
