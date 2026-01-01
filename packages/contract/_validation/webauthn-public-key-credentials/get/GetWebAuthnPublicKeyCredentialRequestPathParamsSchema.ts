import { Schema } from 'effect';

export const GetWebAuthnPublicKeyCredentialRequestPathParamsSchema =
  Schema.Struct({
    id: Schema.UUID,
  }).annotations({
    identifier: 'GetWebAuthnPublicKeyCredentialRequestPathParams',
    title: 'GetWebAuthnPublicKeyCredentialRequestPathParams',
    description: 'Request path params for getting a WebAuthn credential.',
  });
