import { AuthenticatorResponseSchema } from '@repo/virtual-authenticator/validation';

import { BytesArrayBufferBrowserSchemaCodec } from '../codecs/BytesArrayBufferBrowserSchemaCodec';

export const AuthenticatorResponseBrowserSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
  });
