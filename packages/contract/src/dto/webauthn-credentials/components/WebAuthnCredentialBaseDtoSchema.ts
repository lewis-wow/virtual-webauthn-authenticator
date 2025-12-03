import { WebAuthnCredentialBaseSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesSchemaCodec } from '../../codecs/BytesSchemaCodec';
import { DateSchemaCodec } from '../../codecs/DateSchemaCodec';

export const WebAuthnCredentialBaseDtoSchema =
  WebAuthnCredentialBaseSchema.extend({
    COSEPublicKey: BytesSchemaCodec,

    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  });
