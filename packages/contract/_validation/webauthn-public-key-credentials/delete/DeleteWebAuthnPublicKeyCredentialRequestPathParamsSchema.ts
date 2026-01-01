import { Schema } from 'effect';

export const DeleteWebAuthnPublicKeyCredentialRequestPathParamsSchema =
  Schema.Struct({
    id: Schema.UUID,
  }).annotations({
    identifier: 'DeleteWebAuthnPublicKeyCredentialRequestPathParams',
    title: 'DeleteWebAuthnPublicKeyCredentialRequestPathParams',
    description: 'Request path params for deleting a WebAuthn credential.',
  });
