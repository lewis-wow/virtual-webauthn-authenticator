import { Schema } from 'effect';

export const DeleteWebAuthnCredentialRequestPathParamsSchema = Schema.Struct({
  id: Schema.UUID,
}).annotations({
  identifier: 'DeleteWebAuthnCredentialRequestPathParams',
});
