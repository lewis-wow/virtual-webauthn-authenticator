import { PublicKeyCredentialSchema } from '@repo/virtual-authenticator/validation';

export const CreateCredentialResponseSchema =
  PublicKeyCredentialSchema.annotations({
    identifier: 'CreateCredentialResponse',
    title: 'CreateCredentialResponse',
    description: 'Response after creating a new credential.',
  });
