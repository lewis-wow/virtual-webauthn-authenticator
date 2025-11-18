import { AuthenticatorResponseSchema } from '@repo/virtual-authenticator/validation';

import { BytesArrayBufferBrowserSchemaCodec } from '../BytesArrayBufferBrowserSchemaCodec';

export const AuthenticatorResponseBrowserSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesArrayBufferBrowserSchemaCodec,
  });
