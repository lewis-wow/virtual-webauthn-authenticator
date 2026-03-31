import { BytesSchemaCodec } from '@repo/core/validation';
import { DateSchemaCodec } from '@repo/core/validation';
import { WebAuthnPublicKeyCredentialBaseSchema } from '@repo/virtual-authenticator/validation';

export const WebAuthnPublicKeyCredentialBaseDtoSchema =
  WebAuthnPublicKeyCredentialBaseSchema.extend({
    COSEPublicKey: BytesSchemaCodec,

    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  });
