import { DateSchemaCodec } from '../../dto/common/DateSchemaCodec';
import { WebAuthnCredentialKeyVaultKeyMetaSchema } from '../../models/webauthn-credential/WebAuthnCredentialKeyVaultKeyMetaSchema';

export const WebAuthnCredentialKeyVaultKeyMetaDtoSchema =
  WebAuthnCredentialKeyVaultKeyMetaSchema.extend({
    createdAt: DateSchemaCodec,
    updatedAt: DateSchemaCodec,
  });

export type WebAuthnCredentialKeyVaultKeyMetaDto =
  typeof WebAuthnCredentialKeyVaultKeyMetaDtoSchema;
