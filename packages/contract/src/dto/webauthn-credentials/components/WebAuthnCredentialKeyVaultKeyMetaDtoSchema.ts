import { randBoolean, randHex, randUuid } from '@ngneat/falso';
import { WebAuthnCredentialKeyVaultKeyMetaSchema } from '@repo/virtual-authenticator/zod-validation';

import { DateSchemaCodec } from '../../codecs/DateSchemaCodec';

export const WebAuthnCredentialKeyVaultKeyMetaDtoSchema =
  WebAuthnCredentialKeyVaultKeyMetaSchema.extend({
    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  }).meta({
    examples: [
      {
        id: randUuid(),
        hsm: randBoolean(),
        keyVaultKeyId: randHex(),
        get keyVaultKeyName() {
          return this.id;
        },
        createdAt: new Date('24.12.2026').toISOString(),
        updatedAt: new Date('24.12.2026').toISOString(),
      },
    ],
  });
