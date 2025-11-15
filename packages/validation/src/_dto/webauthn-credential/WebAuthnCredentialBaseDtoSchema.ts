import { WebAuthnCredentialBaseSchema } from '../../models/webauthn-credential/WebAuthnCredentialBaseSchema';
import { BytesDtoSchema } from '../common/BytesDtoSchema';

export const WebAuthnCredentialBaseDtoSchema =
  WebAuthnCredentialBaseSchema.extend({
    COSEPublicKey: BytesDtoSchema,
  });

export type WebAuthnCredentialBaseDto = typeof WebAuthnCredentialBaseDtoSchema;
