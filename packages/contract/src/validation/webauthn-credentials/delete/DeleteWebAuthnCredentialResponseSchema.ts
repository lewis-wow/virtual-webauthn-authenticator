import { WebAuthnCredentialSchema } from '@repo/virtual-authenticator/validation';

export const DeleteWebAuthnCredentialResponseSchema =
  WebAuthnCredentialSchema.annotations({
    identifier: 'DeleteWebAuthnCredentialResponse',
  });
