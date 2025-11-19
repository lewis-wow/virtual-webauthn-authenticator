import { WebAuthnCredentialSchema } from '@repo/virtual-authenticator/validation';

export const GetWebAuthnCredentialResponseSchema =
  WebAuthnCredentialSchema.annotations({
    identifier: 'GetWebAuthnCredentialResponse',
  });
