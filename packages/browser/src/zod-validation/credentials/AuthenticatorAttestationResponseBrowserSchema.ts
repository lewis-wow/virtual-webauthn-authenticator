import { AuthenticatorAttestationResponseSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesArrayBufferBrowserSchemaCodec } from '../codecs/BytesArrayBufferBrowserSchemaCodec';

export const AuthenticatorAttestationResponseBrowserSchema =
  AuthenticatorAttestationResponseSchema.extend({
    attestationObject: BytesArrayBufferBrowserSchemaCodec,
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
  });
