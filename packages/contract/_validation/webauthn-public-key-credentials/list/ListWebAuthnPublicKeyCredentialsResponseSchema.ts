import { PaginationResultSchema } from '@repo/pagination/validation';
import { WebAuthnPublicKeyCredentialSchema } from '@repo/virtual-authenticator/validation';

export const ListWebAuthnPublicKeyCredentialsResponseSchema = PaginationResultSchema(
  WebAuthnPublicKeyCredentialSchema,
).annotations({
  identifier: 'ListWebAuthnPublicKeyCredentialsResponse',
  title: 'ListWebAuthnPublicKeyCredentialsResponse',
  description: 'Response with a list of WebAuthn credentials.',
});
