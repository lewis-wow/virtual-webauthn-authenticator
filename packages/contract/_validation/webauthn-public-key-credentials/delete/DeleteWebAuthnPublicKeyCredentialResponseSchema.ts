import { WebAuthnPublicKeyCredentialSchema } from '@repo/virtual-authenticator/validation';

export const DeleteWebAuthnPublicKeyCredentialResponseSchema =
  WebAuthnPublicKeyCredentialSchema.annotations({
    identifier: 'DeleteWebAuthnPublicKeyCredentialResponse',
    title: 'DeleteWebAuthnPublicKeyCredentialResponse',
    description: 'Response after deleting a WebAuthn credential.',
  });
