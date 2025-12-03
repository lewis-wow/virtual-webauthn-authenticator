import { PublicKeyCredentialSchema } from '@repo/virtual-authenticator/validation';

export const GetCredentialResponseSchema =
  PublicKeyCredentialSchema.annotations({
    identifier: 'GetCredentialResponse',
    title: 'GetCredentialResponse',
    description: 'Response after getting a credential.',
  });
