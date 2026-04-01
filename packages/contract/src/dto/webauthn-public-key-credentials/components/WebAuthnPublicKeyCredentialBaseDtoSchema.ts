import { BytesSchemaCodec } from '@repo/validation';
import { DateSchemaCodec } from '@repo/validation';
import { WebAuthnPublicKeyCredentialBaseSchema } from '@repo/virtual-authenticator/validation';

export const WebAuthnPublicKeyCredentialBaseDtoSchema =
  WebAuthnPublicKeyCredentialBaseSchema.extend({
    COSEPublicKey: BytesSchemaCodec,

    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  });
