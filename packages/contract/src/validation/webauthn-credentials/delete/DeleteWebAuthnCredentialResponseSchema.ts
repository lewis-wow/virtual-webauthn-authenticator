import { WebAuthnCredentialSchema } from '@repo/virtual-authenticator/validation';

export const DeleteWebAuthnCredentialResponseSchema =
  WebAuthnCredentialSchema.annotations({
    identifier: 'DeleteWebAuthnCredentialResponse',
    title: 'DeleteWebAuthnCredentialResponse',
    description: 'Response after deleting a WebAuthn credential.',
  });
