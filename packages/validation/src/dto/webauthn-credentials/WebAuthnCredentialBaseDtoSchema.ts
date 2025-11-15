import { WebAuthnCredentialBaseSchema } from '../../models/webauthn-credential/WebAuthnCredentialBaseSchema';
import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const WebAuthnCredentialBaseDtoSchema =
  WebAuthnCredentialBaseSchema.extend({
    COSEPublicKey: BytesSchemaCodec,
  });

export type WebAuthnCredentialBaseDto = typeof WebAuthnCredentialBaseDtoSchema;
