import { WebAuthnCredentialSchema } from '@repo/virtual-authenticator/validation';
import { Schema } from 'effect';

export const ListWebAuthnCredentialsResponseSchema = Schema.Array(
  WebAuthnCredentialSchema,
).annotations({
  identifier: 'ListWebAuthnCredentialsResponse',
});
