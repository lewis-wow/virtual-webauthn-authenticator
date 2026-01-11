import {
  randBetweenDate,
  randBoolean,
  randHex,
  randPastDate,
  randUuid,
} from '@ngneat/falso';
import { DateSchemaCodec } from '@repo/core/zod-validation';
import { WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema } from '@repo/virtual-authenticator/validation';

export const WebAuthnPublicKeyCredentialKeyVaultKeyMetaDtoSchema =
  WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema.extend({
    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  }).meta({
    examples: [
      (() => {
        const createdDate = randPastDate();
        const updatedDate = randBetweenDate({
          from: createdDate,
          to: new Date(),
        });
        const id = randUuid();

        return {
          id: id,
          hsm: randBoolean(),
          keyVaultKeyId: randHex(),
          keyVaultKeyName: id,
          createdAt: createdDate.toISOString(),
          updatedAt: updatedDate.toISOString(),
        };
      })(),
    ],
  });
