import { Schema } from 'effect';

import { WebAuthnPublicKeyCredentialKeyMetaType } from '../../enums/WebAuthnPublicKeyCredentialKeyMetaType';

export const WebAuthnPublicKeyCredentialKeyMetaTypeSchema = Schema.Enums(
  WebAuthnPublicKeyCredentialKeyMetaType,
).pipe(
  Schema.annotations({
    identifier: 'WebAuthnPublicKeyCredentialKeyMetaType',
    title: 'WebAuthnPublicKeyCredentialKeyMetaType',
    examples: [WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT],
  }),
);
