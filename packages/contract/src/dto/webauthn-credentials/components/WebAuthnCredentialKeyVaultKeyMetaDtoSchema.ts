import { WebAuthnCredentialKeyVaultKeyMetaSchema } from '@repo/virtual-authenticator/zod-validation';

import { DateSchemaCodec } from '../../codecs/DateSchemaCodec';

export const WebAuthnCredentialKeyVaultKeyMetaDtoSchema =
  WebAuthnCredentialKeyVaultKeyMetaSchema.extend({
    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  });
