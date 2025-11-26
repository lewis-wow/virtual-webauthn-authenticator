import { Schema } from 'effect';

export const GetWebAuthnCredentialRequestPathParamsSchema = Schema.Struct({
  id: Schema.UUID,
}).annotations({
  identifier: 'GetWebAuthnCredentialRequestPathParams',
  title: 'GetWebAuthnCredentialRequestPathParams',
  description: 'Request path params for getting a WebAuthn credential.',
});
