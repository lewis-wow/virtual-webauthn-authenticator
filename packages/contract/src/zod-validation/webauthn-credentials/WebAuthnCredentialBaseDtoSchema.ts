import { WebAuthnCredentialBaseSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesSchemaCodec } from '../codecs/BytesSchemaCodec';

export const WebAuthnCredentialBaseDtoSchema =
  WebAuthnCredentialBaseSchema.extend({
    COSEPublicKey: BytesSchemaCodec,
  });
