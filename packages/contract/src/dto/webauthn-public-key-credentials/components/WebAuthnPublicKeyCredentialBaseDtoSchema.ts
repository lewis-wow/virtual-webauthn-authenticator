import { BytesSchemaCodec } from '@repo/core/zod-validation';
import { DateSchemaCodec } from '@repo/core/zod-validation';
import { WebAuthnPublicKeyCredentialBaseSchema } from '@repo/virtual-authenticator/validation';

export const WebAuthnPublicKeyCredentialBaseDtoSchema =
  WebAuthnPublicKeyCredentialBaseSchema.extend({
    COSEPublicKey: BytesSchemaCodec,

    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  });
