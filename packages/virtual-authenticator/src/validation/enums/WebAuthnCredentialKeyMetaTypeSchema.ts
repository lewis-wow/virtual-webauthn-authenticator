import { Schema } from 'effect';

import { WebAuthnCredentialKeyMetaType } from '../../enums/WebAuthnCredentialKeyMetaType';

export const WebAuthnCredentialKeyMetaTypeSchema = Schema.Enums(
  WebAuthnCredentialKeyMetaType,
).pipe(
  Schema.annotations({
    identifier: 'WebAuthnCredentialKeyMetaType',
    title: 'WebAuthnCredentialKeyMetaType',
    examples: [WebAuthnCredentialKeyMetaType.KEY_VAULT],
  }),
);
