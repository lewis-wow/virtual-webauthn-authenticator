import { Schema } from 'effect';

export const DeleteWebAuthnCredentialRequestPathParamsSchema = Schema.Struct({
  id: Schema.UUID,
}).annotations({
  identifier: 'DeleteWebAuthnCredentialRequestPathParams',
  title: 'DeleteWebAuthnCredentialRequestPathParams',
  description: 'Request path params for deleting a WebAuthn credential.',
});
