import { WebAuthnPublicKeyCredentialSchema } from '@repo/virtual-authenticator/validation';

export const GetWebAuthnPublicKeyCredentialResponseSchema =
  WebAuthnPublicKeyCredentialSchema.annotations({
    identifier: 'GetWebAuthnPublicKeyCredentialResponse',
    title: 'GetWebAuthnPublicKeyCredentialResponse',
    description: 'Response with a single WebAuthn credential.',
  });
