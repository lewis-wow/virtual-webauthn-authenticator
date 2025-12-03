import { PaginationResultSchema } from '@repo/pagination/validation';
import { WebAuthnCredentialSchema } from '@repo/virtual-authenticator/validation';

export const ListWebAuthnCredentialsResponseSchema = PaginationResultSchema(
  WebAuthnCredentialSchema,
).annotations({
  identifier: 'ListWebAuthnCredentialsResponse',
  title: 'ListWebAuthnCredentialsResponse',
  description: 'Response with a list of WebAuthn credentials.',
});
