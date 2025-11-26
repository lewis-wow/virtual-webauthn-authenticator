import { WebAuthnCredentialSchema } from '@repo/virtual-authenticator/validation';

export const GetWebAuthnCredentialResponseSchema =
  WebAuthnCredentialSchema.annotations({
    identifier: 'GetWebAuthnCredentialResponse',
    title: 'GetWebAuthnCredentialResponse',
    description: 'Response with a single WebAuthn credential.',
  });
