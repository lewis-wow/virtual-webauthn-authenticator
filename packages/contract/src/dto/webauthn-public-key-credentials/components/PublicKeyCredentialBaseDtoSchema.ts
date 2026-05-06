import { BytesSchemaCodec } from '@repo/validation';
import { DateSchemaCodec } from '@repo/validation';
import { WebAuthnPublicKeyCredentialBaseSchema } from '@repo/virtual-authenticator/validation';

export const PublicKeyCredentialBaseDtoSchema =
  WebAuthnPublicKeyCredentialBaseSchema.extend({
    COSEPublicKey: BytesSchemaCodec,

    userHandle: BytesSchemaCodec,

    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  });
