import { WebAuthnCredentialSchema } from '@repo/virtual-authenticator/validation';
import { Schema } from 'effect';

export const ListWebAuthnCredentialsResponseSchema = Schema.mutable(
  Schema.Array(WebAuthnCredentialSchema),
).annotations({
  identifier: 'ListWebAuthnCredentialsResponse',
});
