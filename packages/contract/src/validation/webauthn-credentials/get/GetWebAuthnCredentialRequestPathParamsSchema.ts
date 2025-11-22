import { Schema } from 'effect';

export const GetWebAuthnCredentialRequestPathParamsSchema = Schema.Struct({
  id: Schema.UUID,
}).annotations({
  identifier: 'GetWebAuthnCredentialRequestPathParams',
});
