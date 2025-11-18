import { WebAuthnCredentialBaseSchema } from '@repo/virtual-authenticator/validation';

import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const WebAuthnCredentialBaseDtoSchema =
  WebAuthnCredentialBaseSchema.extend({
    COSEPublicKey: BytesSchemaCodec,
  });
