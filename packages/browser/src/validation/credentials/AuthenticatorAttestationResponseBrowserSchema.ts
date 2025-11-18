import { AuthenticatorAttestationResponseSchema } from '@repo/virtual-authenticator/validation';

import { BytesArrayBufferBrowserSchemaCodec } from '../BytesArrayBufferBrowserSchemaCodec';

export const AuthenticatorAttestationResponseBrowserSchema =
  AuthenticatorAttestationResponseSchema.extend({
    attestationObject: BytesArrayBufferBrowserSchemaCodec,
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
  });
